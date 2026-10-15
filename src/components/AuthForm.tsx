'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { isEmail } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
  next?: string;
}

export function AuthForm({ mode, next = '/dashboard' }: AuthFormProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<'password' | 'google' | null>(null);

  const isSignup = mode === 'signup';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!isEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Passwords must be at least 8 characters long.');
      return;
    }

    setPending('password');

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`
        }
      });

      setPending(null);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }

      setNotice('Account created. Check your inbox to confirm your email address, then sign in.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setPending(null);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setPending('google');

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`
      }
    });

    if (oauthError) {
      setPending(null);
      setError(oauthError.message);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup ? (
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Wanjiku Kamau"
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.co.ke"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {isSignup ? (
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-md border border-gold/40 bg-accent/10 px-3 py-2 text-sm text-gold-dark">{notice}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending !== null}>
          {pending === 'password' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSignup ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" aria-hidden />
        <span className="relative mx-auto block w-fit bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">
          or
        </span>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={pending !== null}>
        {pending === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? 'Already have an account? ' : 'New to Sheria Docket? '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-medium text-navy underline underline-offset-4 dark:text-foreground"
        >
          {isSignup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </div>
  );
}
