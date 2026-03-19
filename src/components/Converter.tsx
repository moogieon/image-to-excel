import { useState } from 'react';
import FileUploader from './FileUploader';
import DataPreview from './DataPreview';
import { extractWithOCR, type ExtractedData } from '../lib/ocr';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
}

export default function Converter({ lang }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setData(null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await extractWithOCR(file);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <FileUploader lang={lang} onFileSelect={handleFileSelect} disabled={loading} />

      {file && !data && (
        <button
          onClick={handleExtract}
          disabled={loading}
          className={`
            w-full py-3.5 rounded-2xl font-semibold text-[15px]
            animate-slide-up-delayed
            ${loading ? 'opacity-60 cursor-not-allowed' : 'btn-primary'}
          `}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2.5">
              <svg className="animate-spin w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t(lang, 'upload.extracting')}
            </span>
          ) : (
            t(lang, 'upload.extract')
          )}
        </button>
      )}

      {error && (
        <div className="liquid-glass rounded-2xl px-5 py-4 animate-scale-in border-danger/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-danger/15 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-[14px] text-danger leading-relaxed pt-1">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <h2 className="text-[17px] font-semibold tracking-tight animate-fade-in text-text">{t(lang, 'preview.title')}</h2>
          <DataPreview data={data} lang={lang} filename={file?.name ?? 'data'} />
          <button
            onClick={() => { setFile(null); setData(null); setError(null); }}
            className="btn-glass px-4 py-2 rounded-xl text-[13px] font-medium text-primary-light"
          >
            &larr; Convert another file
          </button>
        </div>
      )}
    </div>
  );
}
