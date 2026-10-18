import { useState, type FormEvent } from 'react';
import { Notice } from '../components/Badges';
import { DEMO_PASSWORD_HINT, useAuth } from '../data/auth';

export default function LoginPage() {
  const { unlock } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const ok = await unlock(password);
    setError(!ok);
  }

  return (
    <div className="login">
      <h1>
        <span aria-hidden>🔒</span> Część prywatna
      </h1>
      <p>Ta część aplikacji jest dostępna po podaniu wspólnego hasła.</p>
      <form onSubmit={submit} className="card form">
        <label>
          Hasło
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            aria-invalid={error}
          />
        </label>
        {error && <p className="error-text">✗ Nieprawidłowe hasło.</p>}
        <button className="btn btn-primary" type="submit">
          Wejdź
        </button>
      </form>
      <Notice kind="demo">
        <strong>Dostęp demonstracyjny.</strong> Hasło prototypu: <code>{DEMO_PASSWORD_HINT}</code>. W prototypie bez
        serwera hasło sprawdzane jest w przeglądarce, więc to tylko ukrycie interfejsu, nie ochrona danych. W wersji
        serwerowej ochrona obejmie dane i operacje, a hasło nie trafi do kodu przeglądarki.
      </Notice>
    </div>
  );
}
