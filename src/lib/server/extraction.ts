import { Buffer } from 'node:buffer';

export interface ExtractedField {
  key: string;
  value: string;
}

export interface ExtractedData {
  fields?: ExtractedField[];
  headers: string[];
  rows: string[][];
}

export const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
export const MAX_BASE64_CHARS = 14 * 1024 * 1024;
export const FREE_PAGE_LIMIT = 5;
export const PAID_PLAN_MESSAGE = '무료 테스트는 최대 5장 또는 파일당 10MB까지 지원합니다. 더 많은 페이지/이미지는 유료 플랜 준비중입니다.';

export class ExtractionError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'ExtractionError';
    this.status = status;
    this.code = code;
  }
}

export function estimatePdfPageCount(base64: string): number | undefined {
  const text = Buffer.from(base64, 'base64').toString('latin1');
  const matches = text.match(/\/Type\s*\/Page\b/g);
  return matches?.length;
}

export function validateExtractionInput(base64: string, mimeType: string) {
  if (!base64 || !mimeType) {
    throw new ExtractionError('Missing file data', 400);
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ExtractionError('Unsupported file type. Use PNG, JPG, WebP, or PDF.', 400);
  }
  if (base64.length > MAX_BASE64_CHARS) {
    throw new ExtractionError(PAID_PLAN_MESSAGE, 402, 'PAID_PLAN_PREPARING');
  }
  if (mimeType === 'application/pdf') {
    const pageCount = estimatePdfPageCount(base64);
    if (pageCount && pageCount > FREE_PAGE_LIMIT) {
      throw new ExtractionError(PAID_PLAN_MESSAGE, 402, 'PAID_PLAN_PREPARING');
    }
  }
}

function parseExtractedJson(text: string): ExtractedData {
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

export async function extractWithGemini(base64: string, mimeType: string): Promise<ExtractedData> {
  validateExtractionInput(base64, mimeType);

  const apiKey = import.meta.env.GEMINI_API_KEY;
  const configuredModel = import.meta.env.GEMINI_MODEL;
  const model = !configuredModel || configuredModel === 'gemini-2.0-flash'
    ? 'gemini-2.5-flash'
    : configuredModel;
  if (!apiKey) throw new ExtractionError('GEMINI_API_KEY not configured', 500);

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
    throw new ExtractionError(
      (err as { error?: { message?: string } })?.error?.message ||
        `Gemini API error: ${response.status}`,
      502
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
  if (!text) throw new ExtractionError('Gemini returned empty extraction result', 502);
  return parseExtractedJson(text);
}
