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

export interface ExtractedField {
  key: string;
  value: string;
}

export interface ExtractedData {
  fields?: ExtractedField[];
  headers: string[];
  rows: string[][];
}

const API_BASE = 'http://localhost:8000';

export async function extractWithOCR(file: File): Promise<ExtractedData> {
  const base64 = await fileToBase64(file);

  const response = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64,
      mimeType: file.type,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || `OCR error: ${response.status}`);
  }

  if (!data.headers || !data.rows) {
    throw new Error('Failed to parse OCR results. Please try again.');
  }

  return data as ExtractedData;
}

export async function fetchPreprocessPreview(file: File): Promise<string> {
  const base64 = await fileToBase64(file);

  const response = await fetch(`${API_BASE}/api/preview/preprocess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType: file.type }),
  });

  if (!response.ok) {
    throw new Error(`Preprocess preview failed: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
