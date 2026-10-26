// WebCrypto SHA-256 + Salt password hashing for client-side Admin Demo Auth

const ADMIN_AUTH_STORAGE_KEY = 'adrenalinee_admin_cred_v1';
const ADMIN_SESSION_STORAGE_KEY = 'adrenalinee_admin_session_v1';
const ADMIN_LOCKOUT_STORAGE_KEY = 'adrenalinee_admin_lockout_v1';

export interface StoredAdminCredential {
  salt: string;
  hash: string;
  createdAt: string;
}

export async function sha256WithSalt(password: string, salt: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}::${password}`);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback deterministic hash if subtle crypto is unavailable in non-secure context
  let h = 2166136261;
  const str = `${salt}::${password}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function hasAdminPasswordSetup(): boolean {
  try {
    return Boolean(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY));
  } catch {
    return false;
  }
}

export async function createAdminPassword(password: string): Promise<void> {
  const randomBytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  }
  const salt = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('') || 'adrenalinee_salt_2026';

  const hash = await sha256WithSalt(password, salt);
  const cred: StoredAdminCredential = {
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(cred));
  setAdminSessionActive();
}

export async function verifyAdminPassword(password: string): Promise<{
  ok: boolean;
  lockedUntil?: number;
  attemptsRemaining?: number;
}> {
  const lockoutRaw = localStorage.getItem(ADMIN_LOCKOUT_STORAGE_KEY);
  const now = Date.now();
  let lockout = lockoutRaw
    ? (JSON.parse(lockoutRaw) as { attempts: number; lockedUntil: number })
    : { attempts: 0, lockedUntil: 0 };

  if (lockout.lockedUntil > now) {
    return { ok: false, lockedUntil: lockout.lockedUntil };
  }

  const credRaw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (!credRaw) {
    return { ok: false };
  }

  const cred = JSON.parse(credRaw) as StoredAdminCredential;
  const computed = await sha256WithSalt(password, cred.salt);

  if (computed === cred.hash) {
    localStorage.removeItem(ADMIN_LOCKOUT_STORAGE_KEY);
    setAdminSessionActive();
    return { ok: true };
  }

  const nextAttempts = lockout.attempts + 1;
  if (nextAttempts >= 5) {
    const lockedUntil = now + 60 * 1000;
    localStorage.setItem(
      ADMIN_LOCKOUT_STORAGE_KEY,
      JSON.stringify({ attempts: 0, lockedUntil })
    );
    return { ok: false, lockedUntil, attemptsRemaining: 0 };
  } else {
    localStorage.setItem(
      ADMIN_LOCKOUT_STORAGE_KEY,
      JSON.stringify({ attempts: nextAttempts, lockedUntil: 0 })
    );
    return { ok: false, attemptsRemaining: 5 - nextAttempts };
  }
}

export function setAdminSessionActive(): void {
  try {
    sessionStorage.setItem(
      ADMIN_SESSION_STORAGE_KEY,
      JSON.stringify({ lastActive: Date.now() })
    );
  } catch {
    // ignore storage errors
  }
}

export function checkAdminSessionValid(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as { lastActive: number };
    const thirtyMins = 30 * 60 * 1000;
    if (Date.now() - data.lastActive > thirtyMins) {
      sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return false;
    }
    sessionStorage.setItem(
      ADMIN_SESSION_STORAGE_KEY,
      JSON.stringify({ lastActive: Date.now() })
    );
    return true;
  } catch {
    return false;
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
