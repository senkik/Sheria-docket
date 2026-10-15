import type { Metadata } from 'next';

import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to comment on briefs, download student resources and manage posts on Sheria Docket.'
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to join the discussion and access the Student Hub library.
          </p>
        </div>

        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}
