export const prerender = false;

import type { APIRoute } from 'astro';

const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;

export const POST: APIRoute = async ({ request }) => {
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { base64: string; mimeType: string; filename: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { base64, mimeType, filename } = body;
  if (!base64 || !mimeType) {
    return new Response(JSON.stringify({ error: 'Missing file data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isImage = mimeType.startsWith('image/');
  const content: Array<Record<string, unknown>> = [];

  if (isImage) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${base64}` },
    });
  } else {
    content.push({
      type: 'file',
      file: { filename: filename || 'document.pdf', file_data: `data:${mimeType};base64,${base64}` },
    });
  }

  content.push({
    type: 'text',
    text: `Extract all tabular data from this document. Return the result as a JSON object with:
- "headers": an array of column header strings
- "rows": an array of arrays, where each inner array contains the cell values as strings

If the document contains multiple tables, merge them if they have the same structure, or use the largest table.
If there are no clear headers, generate descriptive headers based on the content.
Return ONLY the JSON object, no markdown or explanation.`,
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }],
      max_tokens: 4096,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    return new Response(
      JSON.stringify({ error: err?.error?.message || `OCR API error: ${response.status}` }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const text = data.choices[0]?.message?.content?.trim() ?? '';

  let jsonStr = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.headers || !parsed.rows) {
      throw new Error('Invalid response structure');
    }
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to parse OCR results. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
