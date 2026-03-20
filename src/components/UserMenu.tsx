import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { signOut, getIdToken } from '../lib/auth';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface PlanInfo {
  plan: string;
  planName: string;
  tokensRemaining: number;
  tokensTotal: number;
  todayUsed?: number;
}

interface Props {
  lang: Lang;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  PAYGO: 'Pay As You Go',
  SUPER_ADMIN: 'Admin',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-600',
  PRO: 'bg-emerald-100 text-emerald-700',
  PAYGO: 'bg-blue-100 text-blue-700',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
};

export default function UserMenu({ lang }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 팝오버 열릴 때 플랜 정보 가져오기
  useEffect(() => {
    if (!open || !user) return;

    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setPlanInfo(await res.json());
        }
      } catch {
        // 무시
      }
    })();
  }, [open, user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = `/${lang}`;
  };

  if (loading) return null;

  if (!user) {
    return (
      <a
        href={`/${lang}/login`}
        className="px-4 py-1.5 rounded-full text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        {t(lang, 'nav.login')}
      </a>
    );
  }

  const initial = (user.displayName || user.email || '?')[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 rounded-full bg-emerald-500 text-white text-[13px] font-semibold flex items-center justify-center hover:bg-emerald-600 transition-colors"
        title={user.displayName || user.email || ''}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white/90 backdrop-blur-2xl rounded-2xl py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/30 min-w-[240px] z-50">
          {/* 유저 정보 */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="text-[13px] font-medium text-gray-900 truncate">{user.displayName || t(lang, 'auth.user')}</p>
            <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
          </div>

          {/* 플랜 + 크레딧 */}
          {planInfo && (
            <div className="px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-gray-500">{t(lang, 'auth.plan')}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[planInfo.plan] || PLAN_COLORS.FREE}`}>
                  {PLAN_LABELS[planInfo.plan] || planInfo.plan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">{t(lang, 'auth.credits')}</span>
                <span className="text-[12px] font-medium text-gray-900">
                  {planInfo.plan === 'FREE'
                    ? `${planInfo.todayUsed ?? 0}/3 today`
                    : planInfo.plan === 'SUPER_ADMIN'
                      ? '∞'
                      : `${planInfo.tokensRemaining}/${planInfo.tokensTotal}`
                  }
                </span>
              </div>
            </div>
          )}

          {/* 메뉴 */}
          <a
            href={`/${lang}/mypage`}
            className="block w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50/80 transition-colors"
          >
            {t(lang, 'auth.mypage')}
          </a>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50/50 transition-colors"
          >
            {t(lang, 'auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
