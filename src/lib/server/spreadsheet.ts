import * as XLSX from 'xlsx';
import type { ExtractedData } from './extraction';

export function dataToSheetRows(data: ExtractedData): string[][] {
  const rows: string[][] = [];
  if (data.fields && data.fields.length > 0) {
    for (const field of data.fields) {
      rows.push([field.key, field.value]);
    }
    rows.push([]);
  }
  if (data.headers && data.headers.length > 0) {
    rows.push(data.headers);
    rows.push(...data.rows);
  }
  return rows;
}

function autoSizeCols(sheetData: string[][]): { wch: number }[] {
  const maxCols = Math.max(...sheetData.map((row) => row.length), 2);
  return Array.from({ length: maxCols }, (_, i) => {
    const maxLen = Math.max(...sheetData.map((row) => (row[i] ?? '').length));
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
}

export function dataToCSV(data: ExtractedData): string {
  return dataToSheetRows(data)
    .map((row) => row.map((cell) => {
      const value = cell ?? '';
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(','))
    .join('\n');
}

export function dataToXlsxBase64(data: ExtractedData, sheetName = 'Sheet1'): string {
  const sheetData = dataToSheetRows(data);
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = autoSizeCols(sheetData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Sheet1');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
}
