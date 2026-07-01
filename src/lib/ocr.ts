const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const FREE_PAGE_LIMIT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please upload PDF, PNG, JPG, or WebP.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return '무료 테스트는 파일당 10MB까지 지원합니다. 더 큰 파일은 유료 플랜 준비중입니다.';
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

import { getFingerprint } from './fingerprint';

export async function extractWithOCR(file: File): Promise<ExtractedData> {
  const base64 = await fileToBase64(file);

  const fingerprint = await getFingerprint();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Fingerprint': fingerprint,
  };

  const response = await fetch('/api/extract', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base64,
      mimeType: file.type,
      fileName: file.name,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.detail || `OCR error: ${response.status}`);
  }

  if (!data.headers || !data.rows) {
    throw new Error('Failed to parse OCR results. Please try again.');
  }

  return data as ExtractedData;
}

export async function fetchPreprocessPreview(file: File): Promise<string> {
  const base64 = await fileToBase64(file);

  const token = await getIdToken();
  const response = await fetch('/api/preview/preprocess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ base64, mimeType: file.type }),
  });

  if (!response.ok) {
    throw new Error(`Preprocess preview failed: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
