import type { APIRoute } from 'astro';

export const prerender = false;

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
const MAX_BASE64_CHARS = 28 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

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
  if (!Array.isArray(parsed.headers) || !Array.isArray(parsed.rows)) {
    throw new Error('Invalid response structure');
  }
  if (!parsed.headers.every((item: unknown) => typeof item === 'string')) {
    throw new Error('Invalid header structure');
  }
  if (!parsed.rows.every((row: unknown) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'))) {
    throw new Error('Invalid row structure');
  }
  return parsed;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
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
    const fingerprint = request.headers.get('X-Fingerprint');
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('cf-connecting-ip')
      || 'unknown';
    const rateLimitKey = fingerprint || clientIp;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429 });
    }

    const body = await request.json();
    const { base64, mimeType } = body as { base64: string; mimeType: string };

    if (!base64 || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing file data' }), { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return new Response(JSON.stringify({ error: 'Unsupported file type. Use PNG, JPG, WebP, or PDF.' }), { status: 400 });
    }
    if (base64.length > MAX_BASE64_CHARS) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 20MB.' }), { status: 413 });
    }

    const ocrText = await ocrWithVision(base64);
    const result = await structureWithGpt4o(ocrText);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
