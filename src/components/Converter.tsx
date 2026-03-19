import { useState } from 'react';
import FileUploader from './FileUploader';
import DataPreview from './DataPreview';
import { extractWithOCR, type ExtractedData } from '../lib/ocr';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
}

const API_KEY_STORAGE = 'i2e_api_key';

export default function Converter({ lang }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE) ?? '';
    }
    return '';
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setData(null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!file) return;
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key.');
      setShowApiKey(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem(API_KEY_STORAGE, apiKey);
      const result = await extractWithOCR(file, apiKey);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* API Key */}
      <div className="liquid-glass rounded-[24px] overflow-hidden animate-slide-up">
        <button
          type="button"
          onClick={() => setShowApiKey(!showApiKey)}
          className="flex items-center gap-2.5 w-full px-5 py-3.5 text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-200"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          API Key
          <svg
            className="w-4 h-4 ml-auto text-text-muted transition-transform duration-300"
            style={{ transform: showApiKey ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          className="overflow-hidden"
          style={{
            maxHeight: showApiKey ? '200px' : '0px',
            opacity: showApiKey ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          }}
        >
          <div className="px-5 pb-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2.5 text-[14px] rounded-xl liquid-input outline-none"
            />
            <p className="mt-2 text-[12px] text-text-muted px-1">
              Stored locally. Never sent to our servers.
            </p>
          </div>
        </div>
      </div>

      <FileUploader lang={lang} onFileSelect={handleFileSelect} disabled={loading} />

      {file && !data && (
        <button
          onClick={handleExtract}
          disabled={loading}
          className={`
            w-full py-3.5 rounded-[20px] font-semibold text-white text-[15px]
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
        <div className="liquid-glass rounded-[20px] px-5 py-4 animate-scale-in" style={{ borderColor: 'rgba(214, 59, 49, 0.2)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D63B31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-[14px] text-danger/90 leading-relaxed pt-1">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <h2 className="text-[17px] font-semibold tracking-tight animate-fade-in">{t(lang, 'preview.title')}</h2>
          <DataPreview data={data} lang={lang} filename={file?.name ?? 'data'} />
          <button
            onClick={() => { setFile(null); setData(null); setError(null); }}
            className="btn-glass px-4 py-2 rounded-xl text-[13px] font-medium text-primary"
          >
            &larr; Convert another file
          </button>
        </div>
      )}
    </div>
  );
}
