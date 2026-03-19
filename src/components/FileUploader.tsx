import { useState, useRef, useCallback, useEffect } from 'react';
import { validateFile } from '../lib/ocr';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploader({ lang, onFileSelect, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      } else {
        setPreview(null);
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
          }
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  return (
    <div className="w-full animate-slide-up">
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        className={`
          relative rounded-[28px] p-8 md:p-10 text-center cursor-pointer
          ${isDragging
            ? 'liquid-glass-green scale-[1.02]'
            : 'liquid-glass liquid-glass-hover'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="space-y-4 animate-scale-in">
            <img src={preview} alt="Preview" className="max-h-52 mx-auto rounded-2xl shadow-lg" />
            <p className="text-sm text-text-secondary font-medium">{fileName}</p>
          </div>
        ) : fileName ? (
          <div className="space-y-3 animate-scale-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text">{fileName}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#28A06A] to-[#217346] flex items-center justify-center shadow-lg shadow-primary/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <p className="text-[17px] font-semibold text-text tracking-tight">{t(lang, 'upload.dragdrop')}</p>
              <p className="text-[15px] text-text-muted">
                {t(lang, 'upload.or')}{' '}
                <span className="text-primary font-medium">{t(lang, 'upload.browse')}</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <kbd className="text-[10px] font-mono bg-white/30 px-1.5 py-0.5 rounded border border-white/20">Ctrl</kbd>
                <span>+</span>
                <kbd className="text-[10px] font-mono bg-white/30 px-1.5 py-0.5 rounded border border-white/20">V</kbd>
              </span>
              <p className="text-xs text-text-muted">{t(lang, 'upload.supported')}</p>
            </div>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 rounded-[28px] border-2 border-dashed border-primary/50 flex items-center justify-center animate-fade-in">
            <div className="text-primary font-semibold text-lg">Drop here</div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-danger animate-slide-up px-1">
          <div className="w-5 h-5 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          {error}
        </div>
      )}
    </div>
  );
}
