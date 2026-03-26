import type { APIRoute } from 'astro';
import { verifyToken, dcQuery, dcMutation, getAdminAuth } from '../../lib/admin';
import type { GetUserWithPlanData, GetTodayUsageData, CreateUserData } from '../../lib/dataconnect-sdk';

export const prerender = false;

// 플랜별 일일 무료 제한
const DAILY_FREE_LIMIT = 3;
const ANON_TRIAL_LIMIT = 2;

const EXTRACTION_PROMPT = `Extract all tabular data from the following OCR text. Return the result as a JSON object with:
- "headers": an array of column header strings
- "rows": an array of arrays, where each inner array contains the cell values as strings

Rules:
- If text appears garbled, partially missing, or has strange characters, infer the correct text from context (e.g. "주문소" → "주문취소", "배송?" → "배송중")
- These garbled texts are likely caused by strikethrough lines in the original image
- If the text contains multiple tables, merge them if they have the same structure, or use the largest table
- If there are no clear headers, generate descriptive headers based on the content
- Return ONLY the JSON object, no markdown or explanation

OCR Text:
`;

function parseExtractedJson(text: string) {
  let jsonStr = text.trim();
  jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  const parsed = JSON.parse(jsonStr.trim());
  if (!parsed.headers || !parsed.rows) {
    throw new Error('Invalid response structure');
  }
  return parsed;
}

// Step 1: Google Cloud Vision API → 이미지에서 텍스트 추출 (OCR)
async function ocrWithVision(base64: string): Promise<string> {
  const apiKey = import.meta.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ||
        `Vision API error: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    responses: Array<{
      textAnnotations?: Array<{ description: string }>;
      error?: { message: string };
    }>;
  };

  const result = data.responses[0];
  if (result.error) throw new Error(result.error.message);

  const ocrText = result.textAnnotations?.[0]?.description?.trim();
  if (!ocrText) throw new Error('No text detected in the image.');

  return ocrText;
}

// Step 2: GPT-4o → OCR 텍스트를 테이블 구조로 가공
async function structureWithGpt4o(ocrText: string) {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + ocrText,
        },
      ],
      max_tokens: 4096,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ||
        `OpenAI API error: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return parseExtractedJson(data.choices[0]?.message?.content?.trim() ?? '');
}

// ─── API Route ───
export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. 인증 검증
    const authHeader = request.headers.get('Authorization');
    const rawToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const fingerprint = request.headers.get('X-Fingerprint');
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('cf-connecting-ip')
      || 'unknown';

    let uid: string | null = null;
    let isAnonymous = false;

    if (rawToken) {
      try {
        uid = await verifyToken(authHeader);
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
      }
    } else {
      // 비로그인 체험 모드
      isAnonymous = true;

      if (!fingerprint) {
        return new Response(JSON.stringify({ error: 'Login required' }), { status: 401 });
      }

      // 핑거프린트 OR IP 중 하나라도 이미 사용했으면 차단
      const [byFp, byIp] = await Promise.all([
        dcQuery<{ anonUsages: { id: string }[] }>('CheckAnonUsageByFingerprint', { fingerprint }),
        dcQuery<{ anonUsages: { id: string }[] }>('CheckAnonUsageByIp', { ip: clientIp }),
      ]);

      const anonUsed = Math.max(byFp.anonUsages.length, byIp.anonUsages.length);
      if (anonUsed >= ANON_TRIAL_LIMIT) {
        return new Response(JSON.stringify({
          error: 'Free trial limit reached. Please sign up to continue.',
          code: 'TRIAL_USED',
        }), { status: 429 });
      }
    }

    // 2. 로그인 유저: 구독 정보 조회
    let user: any = null;
    let activePlan: any = null;

    if (uid) {
      let userData = await dcQuery<GetUserWithPlanData>('GetUserWithPlan', { uid }, rawToken);
      user = userData.users[0];

      if (!user) {
        const authUser = await getAdminAuth().getUser(uid);
        const createResult = await dcMutation<CreateUserData>('CreateUser', {
          uid,
          email: authUser.email || '',
          displayName: authUser.displayName || null,
        }, rawToken);

        const userId = createResult.user_insert;
        if (userId) {
          await dcMutation('CreateFreeUserPlan', { userId });
        }

        userData = await dcQuery<GetUserWithPlanData>('GetUserWithPlan', { uid }, rawToken);
        user = userData.users[0];

        if (!user) {
          return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500 });
        }
      }

      activePlan = user.userPlans_on_user.find((p: any) => p.status === 'ACTIVE');

      // 3. 크레딧 체크 (SUPER_ADMIN은 무제한)
      if (user.plan === 'SUPER_ADMIN') {
        // 무제한
      } else if (user.plan === 'FREE' || !activePlan) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const usageData = await dcQuery<GetTodayUsageData>('GetTodayUsage', {
          uid,
          today: today.toISOString(),
        }, rawToken);
        const todayUsed = usageData.usageLogs.reduce((sum, log) => sum + log.pagesUsed, 0);

        if (todayUsed >= DAILY_FREE_LIMIT) {
          return new Response(JSON.stringify({
            error: 'Daily free limit reached',
            code: 'LIMIT_EXCEEDED',
            used: todayUsed,
            limit: DAILY_FREE_LIMIT,
          }), { status: 429 });
        }
      } else {
        if (activePlan.tokensRemaining <= 0) {
          return new Response(JSON.stringify({
            error: 'No tokens remaining',
            code: 'NO_TOKENS',
            tokensRemaining: 0,
          }), { status: 429 });
        }
      }
    }

    // 4. 요청 파싱
    const body = await request.json();
    const { base64, mimeType } = body as { base64: string; mimeType: string };

    if (!base64 || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing file data' }), { status: 400 });
    }

    // 5. OCR 처리
    const ocrText = await ocrWithVision(base64);
    const result = await structureWithGpt4o(ocrText);

    // 6. 사용 기록 + 크레딧 차감
    if (isAnonymous) {
      await dcMutation('LogAnonUsage', { fingerprint: fingerprint!, ip: clientIp });
    } else {
      await dcMutation('LogUsage', {
        userId: { id: user.id },
        pagesUsed: 1,
        fileName: (body as { fileName?: string }).fileName || null,
      });

      if (activePlan && user.plan !== 'FREE' && user.plan !== 'SUPER_ADMIN') {
        await dcMutation('DeductToken', {
          userPlanId: { id: activePlan.id },
          remaining: activePlan.tokensRemaining - 1,
        });
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
