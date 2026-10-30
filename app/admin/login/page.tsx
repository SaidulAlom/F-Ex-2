'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/** Credentials login. No marketing flourish here — staff need speed. */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-ink text-cream/50">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Wrong email or password.');
      return;
    }
    router.push(params.get('callbackUrl') ?? '/admin');
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-cream">F-EX</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4em] text-peach/70">Staff sign in</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-peach/25 bg-plum/25 p-6">
          <div>
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-cream/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream/15 bg-ink px-3 py-2.5 text-sm text-cream focus:border-peach focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-cream/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream/15 bg-ink px-3 py-2.5 text-sm text-cream focus:border-peach focus:outline-none"
            />
          </div>

          {error && <p role="alert" className="text-xs text-rose">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-peach py-3 text-[10px] uppercase tracking-[0.2em] text-ink-deep disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] text-cream/30">
          Staff accounts are created by the owner via <code className="text-cream/50">npm run seed</code>.
        </p>
      </div>
    </main>
  );
}
