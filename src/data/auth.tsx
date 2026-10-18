import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * DEMONSTRACYJNA ochrona hasłem. W prototypie bez serwera hasło sprawdzane jest
 * w przeglądarce, więc to wyłącznie ukrycie interfejsu, a nie ochrona danych.
 * W wersji serwerowej sprawdzanie hasła i ochrona danych muszą odbywać się na serwerze
 * (wymagania, rozdz. 2).
 *
 * Przechowujemy tylko skrót SHA-256 hasła demonstracyjnego „kamper”.
 */
const DEMO_PASSWORD_SHA256 = '7b1516947c2bbd2402636a3bb861f2e9ec380cb47311497e6b49f707eed4b917';
export const DEMO_PASSWORD_HINT = 'kamper';
const SESSION_KEY = 'kamper-mizar-dostep';

async function sha256Hex(text: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface Auth {
  unlocked: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<Auth | null>(null);

function readSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(readSession);

  const unlock = useCallback(async (password: string) => {
    const hash = await sha256Hex(password.trim());
    // Bez Web Crypto (np. strona otwarta przez http z adresu IP) porównujemy jawnie — tylko w prototypie.
    const ok = hash === null ? password.trim() === DEMO_PASSWORD_HINT : hash === DEMO_PASSWORD_SHA256;
    if (ok) {
      setUnlocked(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignorujemy */
      }
    }
    return ok;
  }, []);

  const lock = useCallback(() => {
    setUnlocked(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignorujemy */
    }
  }, []);

  const value = useMemo(() => ({ unlocked, unlock, lock }), [unlocked, unlock, lock]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const a = useContext(AuthContext);
  if (!a) throw new Error('useAuth poza AuthProvider');
  return a;
}
