const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please upload PDF, PNG, JPG, or WebP.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 20MB.';
  }
  return null;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface ExtractedData {
  headers: string[];
  rows: string[][];
}

export async function extractWithOCR(
  file: File,
  apiKey: string
): Promise<ExtractedData> {
  const base64 = await fileToBase64(file);
  const isImage = file.type.startsWith('image/');

  const content: Array<Record<string, unknown>> = [];

  if (isImage) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${file.type};base64,${base64}`,
      },
    });
  } else {
    content.push({
      type: 'file',
      file: {
        filename: file.name,
        file_data: `data:${file.type};base64,${base64}`,
      },
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
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content,
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
        `OCR API error: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const text = data.choices[0]?.message?.content?.trim() ?? '';

  // Parse JSON from response, handling possible markdown code blocks
  let jsonStr = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr) as ExtractedData;
    if (!parsed.headers || !parsed.rows) {
      throw new Error('Invalid response structure');
    }
    return parsed;
  } catch {
    throw new Error('Failed to parse OCR results. Please try again.');
  }
}
