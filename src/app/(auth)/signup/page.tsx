import type { Metadata } from 'next';

import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a Sheria Docket account to comment on case briefs and access student resources.'
};

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Readers can comment and download resources. Contributors can apply for an author or editor role after
            signing up.
          </p>
        </div>

        <AuthForm mode="signup" next={next} />
      </div>
    </div>
  );
}
