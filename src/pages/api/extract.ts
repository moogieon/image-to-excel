import type { APIRoute } from 'astro';
import { ExtractionError, extractWithGemini } from '../../lib/server/extraction';

export const prerender = false;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const fingerprint = request.headers.get('X-Fingerprint');
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('cf-connecting-ip')
      || 'unknown';
    const rateLimitKey = fingerprint || clientIp;
    if (!checkRateLimit(rateLimitKey)) {
      return json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
    }

    const body = await request.json();
    const { base64, mimeType } = body as { base64: string; mimeType: string };
    const result = await extractWithGemini(base64, mimeType);
    return json(result);
  } catch (err) {
    if (err instanceof ExtractionError) {
      return json({ error: err.message, code: err.code }, err.status);
    }
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return json({ error: message }, 500);
  }
};
