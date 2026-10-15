import { redirect } from 'next/navigation';

import { PostForm } from '@/components/PostForm';
import { canCreateContent, requireProfile } from '@/lib/auth';
import type { UserRole } from '@/types/database';

export default async function NewPostPage() {
  const profile = await requireProfile('/dashboard/posts/new');

  if (!canCreateContent(profile.role)) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">New post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Case briefs collect the citation, bench, facts, issues, holding and obiter dicta separately so the published page
          reads the way a court reasons.
        </p>
      </header>

      <PostForm role={(profile.role as UserRole) ?? 'author'} />
    </div>
  );
}
