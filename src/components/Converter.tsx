import { useState, useCallback, useEffect, useRef } from 'react';
import FileUploader from './FileUploader';
import DataPreview from './DataPreview';
import { extractWithOCR, type ExtractedData } from '../lib/ocr';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';
import { downloadExcel } from '../lib/excel';
import funFacts from '../data/fun-facts.json';

interface FileItem {
  file: File;
  status: 'ready' | 'extracting' | 'done' | 'error';
  data?: ExtractedData;
  error?: string;
  thumbUrl?: string;
}

type Step = 'upload' | 'ready' | 'extracting' | 'result';

export default function Converter({ lang }: { lang: Lang }) {
  const [step, setStep] = useState<Step>('upload');
  const [items, setItems] = useState<FileItem[]>([]);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  const MAX_FILES = 10;

  const handleFileSelect = useCallback((files: File[]) => {
    setItems(prev => {
      const combined = [
        ...prev,
        ...files.map(f => ({
          file: f,
          status: 'ready' as const,
          thumbUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        })),
      ];
      return combined.slice(0, MAX_FILES);
    });
    setStep('ready');
  }, []);

  const handleRemoveFile = (index: number) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setStep('upload');
      return next;
    });
  };

  const handleExtract = async () => {
    setStep('extracting');
    for (let i = 0; i < items.length; i++) {
      setItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'extracting' } : item
      ));
      try {
        const data = await extractWithOCR(items[i].file);
        setItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'done', data } : item
        ));
      } catch (err) {
        setItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : item
        ));
      }
    }
    setStep('result');
  };

  const handleReExtract = () => {
    setItems(prev => prev.map(item => ({
      ...item,
      status: 'ready' as const,
      data: undefined,
      error: undefined,
    })));
    setStep('ready');
    setPreviewItem(null);
  };

  const handleReset = () => {
    setItems([]);
    setStep('upload');
    setPreviewItem(null);
  };

  const truncName = (name: string, max = 28) =>
    name.length > max ? name.slice(0, max - 3) + '...' : name;

  const isExtracting = step === 'extracting';
  const doneItems = items.filter(i => i.status === 'done' && i.data);

  const [currentFact, setCurrentFact] = useState('');
  const [factVisible, setFactVisible] = useState(false);

  useEffect(() => {
    if (!isExtracting) {
      setFactVisible(false);
      return;
    }
    const pick = () => funFacts[Math.floor(Math.random() * funFacts.length)];
    setCurrentFact(pick());
    setFactVisible(true);

    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setCurrentFact(pick());
        setFactVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [isExtracting]);

  return (
    <div className="space-y-5">
      {/* Upload area */}
      {(step === 'upload' || step === 'ready') && (
        <FileUploader lang={lang} onFileSelect={handleFileSelect} disabled={isExtracting} />
      )}

      {/* File grid */}
      {items.length > 0 && step !== 'upload' && (
        <div className="liquid-glass rounded-2xl p-4 animate-slide-up">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {items.map((item, i) => (
              <div
                key={`${item.file.name}-${i}`}
                className="relative"
              >
                {/* Thumbnail */}
                <div className="aspect-square rounded-xl bg-black/5 overflow-hidden">
                  {item.thumbUrl ? (
                    <img src={item.thumbUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-light">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                  )}

                  {/* Extracting overlay */}
                  {item.status === 'extracting' && (
                    <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
                      <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}

                  {/* Done overlay */}
                  {item.status === 'done' && (
                    <div className="absolute inset-0 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  {/* Error overlay */}
                  {item.status === 'error' && (
                    <div className="absolute inset-0 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Remove button - top right */}
                {step === 'ready' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(i); }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}

                {/* Filename */}
                <p className="mt-1.5 text-[11px] text-text-muted text-center truncate px-0.5">
                  {truncName(item.file.name, 14)}
                </p>

                {/* Result buttons */}
                {item.status === 'done' && item.data && (
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => setPreviewItem(previewItem === item ? null : item)}
                      className="flex-1 btn-primary py-1 rounded-lg text-[10px] font-medium"
                    >
                      {t(lang, 'result.preview')}
                    </button>
                    <button
                      onClick={() => downloadExcel(item.data!, item.file.name)}
                      className="btn-primary w-7 h-7 rounded-lg flex items-center justify-center"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Progress bar */}
                {item.status === 'extracting' && (
                  <div className="mt-1 h-1 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full bg-primary-light rounded-full animate-progress" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fun fact during extraction */}
      {isExtracting && (
        <p
          className={`text-center text-[16px] text-text-muted italic transition-opacity duration-500 ${factVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          "{currentFact}"
        </p>
      )}

      {/* Extract button */}
      {step === 'ready' && items.length > 0 && (
        <button
          onClick={handleExtract}
          className="w-full py-3.5 rounded-2xl font-semibold text-[15px] btn-primary animate-slide-up-delayed"
        >
          {t(lang, 'upload.extract')}
        </button>
      )}

      {/* Preview panel */}
      {previewItem?.data && (
        <div className="animate-scale-in">
          <DataPreview
            data={previewItem.data}
            lang={lang}
            filename={previewItem.file.name}
            allItems={doneItems.length > 1 ? doneItems.map(i => ({ filename: i.file.name, data: i.data! })) : undefined}
          />
        </div>
      )}

      {/* Result action buttons */}
      {step === 'result' && (
        <div className="flex flex-col items-center gap-3 animate-slide-up">
          <button
            onClick={handleReExtract}
            className="w-full py-3.5 rounded-2xl font-semibold text-[15px] btn-primary inline-flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            {t(lang, 'result.reExtract')}
          </button>
          <button
            onClick={handleReset}
            className="text-[13px] text-text-muted hover:text-primary-light transition-colors inline-flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t(lang, 'result.tryAnother')}
          </button>
        </div>
      )}
    </div>
  );
}
