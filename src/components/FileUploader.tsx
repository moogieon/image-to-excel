import { useState, useRef, useCallback, useEffect } from 'react';
import { validateFile } from '../lib/ocr';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUploader({ lang, onFileSelect, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const valid: File[] = [];
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        valid.push(file);
      }
      if (valid.length === 0) return;
      setFileName(valid.length === 1 ? valid[0].name : `${valid.length} files`);
      onFileSelect(valid);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles]
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
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFiles]);

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
          relative rounded-[24px] p-8 md:p-10 text-center cursor-pointer
          ${isDragging
            ? 'liquid-glass-accent scale-[1.02]'
            : 'liquid-glass liquid-glass-hover'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden">
              <img src="/images/icon-upload.jpg" alt="Upload" width="64" height="64" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[17px] font-semibold text-text tracking-tight">{t(lang, 'upload.dragdrop')}</p>
              <p className="text-[15px] text-text-muted">
                {t(lang, 'upload.or')}{' '}
                <span className="text-primary-light font-medium">{t(lang, 'upload.browse')}</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-black/4 px-3 py-1.5 rounded-full border border-black/6">
                <kbd className="text-[10px] font-mono bg-black/8 px-1.5 py-0.5 rounded border border-black/6">Ctrl</kbd>
                <span>+</span>
                <kbd className="text-[10px] font-mono bg-black/8 px-1.5 py-0.5 rounded border border-black/6">V</kbd>
              </span>
              <p className="text-xs text-text-muted">{t(lang, 'upload.supported')}</p>
            </div>
          </div>

        {isDragging && (
          <div className="absolute inset-0 rounded-[24px] border-2 border-dashed border-primary/50 flex items-center justify-center animate-fade-in">
            <div className="text-primary-light font-semibold text-lg">Drop here</div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-danger animate-slide-up px-1">
          <div className="w-5 h-5 rounded-full bg-danger/15 flex items-center justify-center shrink-0">
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
