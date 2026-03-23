import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { getIdToken } from '../lib/auth';
import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
}

interface UserInfo {
  uid: string;
  email: string;
  displayName: string | null;
  plan: string;
  planName: string;
  tokensRemaining: number;
  tokensTotal: number;
  todayUsed: number;
  billingCycle: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  canceledAt: string | null;
  memberSince: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  PAYGO: 'Pay As You Go',
  SUPER_ADMIN: 'Super Admin',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'from-gray-400 to-gray-500',
  PRO: 'from-emerald-400 to-emerald-600',
  PAYGO: 'from-blue-400 to-blue-600',
  SUPER_ADMIN: 'from-purple-400 to-purple-600',
};

export default function MyPage({ lang }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        window.location.href = `/${lang}/login`;
      }
    });
    return unsubscribe;
  }, [lang]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setInfo(await res.json());
        } else {
          setError('Failed to load user info');
        }
      } catch {
        setError('Failed to load user info');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 text-[14px]">{error}</div>;
  }

  if (!info) return null;

  const creditPercent = info.plan === 'SUPER_ADMIN'
    ? 100
    : info.plan === 'FREE'
      ? ((3 - info.todayUsed) / 3) * 100
      : (info.tokensRemaining / info.tokensTotal) * 100;

  return (
    <div className="max-w-[600px] mx-auto space-y-6 animate-scale-in">
      {/* 프로필 카드 */}
      <div className="liquid-glass rounded-[24px] p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white text-xl font-bold flex items-center justify-center shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (info.displayName || info.email || '?')[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-gray-900 truncate">{info.displayName || info.email}</h2>
            <p className="text-[13px] text-gray-500 truncate">{info.email}</p>
            {info.memberSince && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                {t(lang, 'auth.memberSince')} {new Date(info.memberSince).toLocaleDateString(lang)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 플랜 + 크레딧 */}
      <div className="liquid-glass rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">{t(lang, 'auth.plan')}</h3>
          <span className={`text-[12px] font-bold text-white px-3 py-1 rounded-full bg-gradient-to-r ${PLAN_COLORS[info.plan] || PLAN_COLORS.FREE}`}>
            {PLAN_LABELS[info.plan] || info.plan}
          </span>
        </div>

        {/* 크레딧 바 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-gray-600">{t(lang, 'auth.credits')}</span>
            <span className="text-[13px] font-semibold text-gray-900">
              {info.plan === 'SUPER_ADMIN'
                ? '∞ Unlimited'
                : info.plan === 'FREE'
                  ? `${3 - info.todayUsed} / 3`
                  : `${info.tokensRemaining} / ${info.tokensTotal}`
              }
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${PLAN_COLORS[info.plan] || PLAN_COLORS.FREE} transition-all duration-500`}
              style={{ width: `${Math.max(0, Math.min(100, creditPercent))}%` }}
            />
          </div>
        </div>

        {info.plan === 'FREE' && (
          <p className="text-[12px] text-gray-400">
            {t(lang, 'auth.freePlan').replace('{used}', String(info.todayUsed)).replace('{limit}', '3')}
          </p>
        )}

        {info.billingCycle && (
          <p className="text-[12px] text-gray-400 mt-1">
            Billing: {info.billingCycle}
            {info.expiresAt && ` · Expires ${new Date(info.expiresAt).toLocaleDateString(lang)}`}
          </p>
        )}

        {info.canceledAt && (
          <p className="text-[12px] text-red-400 mt-1">
            Canceled on {new Date(info.canceledAt).toLocaleDateString(lang)}
          </p>
        )}
      </div>

      {/* 업그레이드 버튼 (Free 플랜일 때) */}
      {info.plan === 'FREE' && (
        <a
          href={`/${lang}#pricing`}
          className="block w-full py-3 rounded-2xl font-semibold text-white text-[15px] text-center btn-primary"
        >
          {t(lang, 'auth.upgrade')}
        </a>
      )}
    </div>
  );
}
