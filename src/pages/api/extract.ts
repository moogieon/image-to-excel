import type { APIRoute } from 'astro';

export const prerender = false;

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
const MAX_BASE64_CHARS = 28 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const EXTRACTION_PROMPT = `Extract all tabular data from the provided image or PDF. Return the result as a JSON object with:
- "headers": an array of column header strings
- "rows": an array of arrays, where each inner array contains the cell values as strings

Rules:
- If text appears garbled, partially missing, or has strange characters, infer the correct text from context (e.g. "주문소" → "주문취소", "배송?" → "배송중")
- These garbled texts are likely caused by strikethrough lines in the original image
- If the text contains multiple tables, merge them if they have the same structure, or use the largest table
- If there are no clear headers, generate descriptive headers based on the content
- Preserve numbers, dates, item names, quantities, and prices as cell strings
- Return ONLY the JSON object, no markdown or explanation
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

async function extractWithGemini(base64: string, mimeType: string) {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  const model = import.meta.env.GEMINI_MODEL || 'gemini-2.0-flash';
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: EXTRACTION_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ||
        `Gemini API error: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
  if (!text) throw new Error('Gemini returned empty extraction result');
  return parseExtractedJson(text);
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

    const result = await extractWithGemini(base64, mimeType);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
