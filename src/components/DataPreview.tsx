import { useState } from 'react';
import type { ExtractedData } from '../lib/ocr';
import { downloadExcel, dataToTSV, openInGoogleSheets } from '../lib/excel';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  data: ExtractedData;
  lang: Lang;
  filename: string;
}

export default function DataPreview({ data, lang, filename }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const tsv = dataToTSV(data);
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4 animate-slide-up">
      <div className="flex flex-wrap gap-2">
        <button onClick={handleCopy} className="btn-glass inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-medium">
          {copied ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-success">{t(lang, 'preview.copied')}</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t(lang, 'preview.copy')}
            </>
          )}
        </button>

        <button
          onClick={() => downloadExcel(data, filename)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-medium"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t(lang, 'preview.download')}
        </button>

        <button onClick={() => openInGoogleSheets(data)} className="btn-glass inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-medium">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-primary-light">
            <path d="M19 11V9h-6V3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8zm-6-7 5 5h-5V4zM8 17v-2h3v2H8zm5 0v-2h3v2h-3zm-5-4v-2h3v2H8zm5 0v-2h3v2h-3z"/>
          </svg>
          {t(lang, 'preview.sheets')}
        </button>
      </div>

      <div className="liquid-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-black/3">
                <th className="px-4 py-3 text-left font-medium text-text-muted text-[11px] uppercase tracking-wider border-b border-black/6 w-12">#</th>
                {data.headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-text text-[11px] uppercase tracking-wider border-b border-black/6 whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-b border-black/4 last:border-b-0 hover:bg-black/3 transition-colors duration-200">
                  <td className="px-4 py-2.5 text-text-muted text-[12px] tabular-nums">{i + 1}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 whitespace-nowrap text-text-secondary">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[12px] text-text-muted text-center tabular-nums">
        {data.rows.length} rows &times; {data.headers.length} columns
      </p>
    </div>
  );
}
