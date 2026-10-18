import type { ReactNode } from 'react';

export function DemoBadge({ children = 'DANE PRZYKŁADOWE' }: { children?: ReactNode }) {
  return (
    <span className="badge badge-demo" title="Dane demonstracyjne — nie są rzeczywistymi danymi">
      <span aria-hidden>◇</span> {children}
    </span>
  );
}

export function SimBadge({ children = 'SYMULACJA' }: { children?: ReactNode }) {
  return (
    <span className="badge badge-sim" title="Wynik symulowany — nie pochodzi z rzeczywistej usługi">
      <span aria-hidden>≈</span> {children}
    </span>
  );
}

export function UnconfirmedBadge({ children = 'NIEPOTWIERDZONE' }: { children?: ReactNode }) {
  return (
    <span className="badge badge-unconfirmed" title="Szczegół niewidoczny w materiałach — wymaga potwierdzenia">
      <span aria-hidden>?</span> {children}
    </span>
  );
}

export function ConfirmedBadge({ children = 'POTWIERDZONE PRZEZ WŁAŚCICIELA' }: { children?: ReactNode }) {
  return (
    <span className="badge badge-confirmed">
      <span aria-hidden>✓</span> {children}
    </span>
  );
}

export function TodoBadge({ children = 'DO UZUPEŁNIENIA' }: { children?: ReactNode }) {
  return (
    <span className="badge badge-todo">
      <span aria-hidden>✎</span> {children}
    </span>
  );
}

export function Notice({ kind = 'sim', children }: { kind?: 'sim' | 'demo' | 'warn'; children: ReactNode }) {
  const icon = kind === 'warn' ? '⚠' : kind === 'demo' ? '◇' : '≈';
  return (
    <div className={`notice notice-${kind}`} role="note">
      <span className="notice-icon" aria-hidden>
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}
