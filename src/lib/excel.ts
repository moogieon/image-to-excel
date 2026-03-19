import * as XLSX from 'xlsx';
import type { ExtractedData } from './ocr';

export function createExcelBlob(data: ExtractedData, filename: string): Blob {
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);

  // Auto-size columns
  const colWidths = data.headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...data.rows.map((r) => (r[i] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadExcel(data: ExtractedData, filename: string): void {
  const blob = createExcelBlob(data, filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\.[^.]+$/, '') + '.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function dataToTSV(data: ExtractedData): string {
  const lines = [data.headers.join('\t'), ...data.rows.map((r) => r.join('\t'))];
  return lines.join('\n');
}

export function openInGoogleSheets(data: ExtractedData): void {
  const csv = [
    data.headers.join(','),
    ...data.rows.map((r) =>
      r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Open Google Sheets import after a short delay
  setTimeout(() => {
    window.open('https://sheets.google.com/create', '_blank');
  }, 500);
}
