import { useState } from 'react';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
  mode: 'login' | 'signup';
}

export default function AuthForm({ lang, mode: initialMode }: Props) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  const isLogin = mode === 'login';

  return (
    <div className="w-full max-w-[400px] mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <a href={`/${lang}`} className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#28A06A] to-[#217346] flex items-center justify-center shadow-lg shadow-primary/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight">Image<span className="text-primary">2</span>Excel</span>
        </a>
        <h1 className="text-[26px] font-bold tracking-tight">
          {isLogin ? t(lang, 'auth.login.title') : t(lang, 'auth.signup.title')}
        </h1>
        <p className="text-[15px] text-text-muted mt-2">
          {isLogin ? t(lang, 'auth.login.subtitle') : t(lang, 'auth.signup.subtitle')}
        </p>
      </div>

      <div className="space-y-2.5 mb-6">
        <button className="btn-glass w-full py-2.5 rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t(lang, 'auth.google')}
        </button>
        <button className="btn-glass w-full py-2.5 rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/15" />
        <span className="text-[12px] text-text-muted font-medium uppercase tracking-wider">{t(lang, 'auth.or')}</span>
        <div className="flex-1 h-px bg-white/15" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {!isLogin && (
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5 ml-1">{t(lang, 'auth.name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl liquid-input outline-none text-[14px]" required />
          </div>
        )}
        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-1.5 ml-1">{t(lang, 'auth.email')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-2xl liquid-input outline-none text-[14px]" required />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-1.5 ml-1">{t(lang, 'auth.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-11 rounded-2xl liquid-input outline-none text-[14px]"
              required
              minLength={8}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-1">
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="text-right">
            <button type="button" className="text-[13px] text-primary hover:text-primary-dark transition-colors">{t(lang, 'auth.forgot')}</button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-2xl font-semibold text-white text-[15px] mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : 'btn-primary'}`}
        >
          {loading ? (
            <svg className="animate-spin w-[18px] h-[18px] mx-auto" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isLogin ? t(lang, 'auth.login.cta') : t(lang, 'auth.signup.cta')}
        </button>
      </form>

      <p className="text-center text-[14px] text-text-muted mt-6">
        {isLogin ? t(lang, 'auth.login.switch') : t(lang, 'auth.signup.switch')}{' '}
        <button onClick={() => setMode(isLogin ? 'signup' : 'login')} className="text-primary font-medium hover:text-primary-dark transition-colors">
          {isLogin ? t(lang, 'auth.signup.link') : t(lang, 'auth.login.link')}
        </button>
      </p>
    </div>
  );
}
