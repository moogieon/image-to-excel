import * as XLSX from 'xlsx';
import type { ExtractedData } from './ocr';

function dataToSheetRows(data: ExtractedData): string[][] {
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
  const maxCols = Math.max(...sheetData.map(r => r.length), 2);
  return Array.from({ length: maxCols }, (_, i) => {
    const maxLen = Math.max(...sheetData.map(r => (r[i] ?? '').length));
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadExcel(data: ExtractedData, filename: string): void {
  const sheetData = dataToSheetRows(data);
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = autoSizeCols(sheetData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, filename.replace(/\.[^.]+$/, '') + '.xlsx');
}

/** 여러 파일 → 1 엑셀, 파일별 시트 */
export function downloadExcelMultiSheet(
  items: { filename: string; data: ExtractedData }[],
): void {
  const wb = XLSX.utils.book_new();
  items.forEach((item, i) => {
    const sheetData = dataToSheetRows(item.data);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = autoSizeCols(sheetData);
    const name = item.filename.replace(/\.[^.]+$/, '').slice(0, 31) || `Sheet${i + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, 'extracted_sheets.xlsx');
}

/** 여러 파일 → 1 엑셀, 1 시트에 전부 합침 */
export function downloadExcelMerged(
  items: { filename: string; data: ExtractedData }[],
): void {
  const allRows: string[][] = [];
  items.forEach((item, i) => {
    if (i > 0) allRows.push([]); // separator between files
    allRows.push([`── ${item.filename} ──`]);
    allRows.push(...dataToSheetRows(item.data));
  });

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = autoSizeCols(allRows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'All');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, 'extracted_merged.xlsx');
}

export function dataToTSV(data: ExtractedData): string {
  const lines: string[] = [];
  if (data.fields && data.fields.length > 0) {
    for (const field of data.fields) {
      lines.push(`${field.key}\t${field.value}`);
    }
    lines.push('');
  }
  if (data.headers && data.headers.length > 0) {
    lines.push(data.headers.join('\t'));
    lines.push(...data.rows.map(r => r.join('\t')));
  }
  return lines.join('\n');
}
