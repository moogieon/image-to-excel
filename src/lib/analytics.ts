import { getAnalytics, logEvent, setUserId, type Analytics } from 'firebase/analytics';
import { getApps } from 'firebase/app';

let _analytics: Analytics | undefined;

function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === 'undefined') return null;
  if (_analytics) return _analytics;
  const app = getApps()[0];
  if (!app) return null;
  _analytics = getAnalytics(app);
  return _analytics;
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, name, params);
}

export function identifyUser(uid: string) {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;
  setUserId(analytics, uid);
}

export function clearUser() {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;
  setUserId(analytics, '');
}
