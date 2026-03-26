import { getIdToken } from './auth';

export interface UserInfo {
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

let _cached: UserInfo | null = null;
let _fetching: Promise<UserInfo | null> | null = null;
const _listeners = new Set<(info: UserInfo | null) => void>();

export function getUserInfo(): UserInfo | null {
  return _cached;
}

export async function fetchUserInfo(): Promise<UserInfo | null> {
  if (_cached) return _cached;
  if (_fetching) return _fetching;

  _fetching = (async () => {
    try {
      const token = await getIdToken();
      if (!token) return null;
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      _cached = await res.json();
      _listeners.forEach(fn => fn(_cached));
      return _cached;
    } catch {
      return null;
    } finally {
      _fetching = null;
    }
  })();

  return _fetching;
}

export function clearUserInfo() {
  _cached = null;
  _fetching = null;
  _listeners.forEach(fn => fn(null));
}

export function onUserInfoChange(fn: (info: UserInfo | null) => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
