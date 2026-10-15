import { NextResponse, type NextRequest } from 'next/server';

import { apiError, readJson, requireUser } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

interface BookmarkPayload {
  post_id?: string;
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const payload = await readJson<BookmarkPayload>(request);
  const postId = payload?.post_id?.trim();

  if (!postId) return apiError('A brief id is required.');

  const supabase = await createClient();
  // Row Level Security only exposes published briefs and the reader's own work,
  // so this doubles as a check that the brief is readable at all.
  const { data: post } = await supabase.from('posts').select('id').eq('id', postId).maybeSingle();

  if (!post) return apiError('That brief could not be found.', 404);

  const { error } = await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId });

  // Saving an already saved brief is success, not an error.
  if (error && error.code !== '23505') {
    return apiError('Could not add that brief to your reading list.', 500);
  }

  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const postId = request.nextUrl.searchParams.get('post_id')?.trim();

  if (!postId) return apiError('A brief id is required.');

  const supabase = await createClient();
  const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId);

  if (error) return apiError('Could not remove that brief from your reading list.', 500);

  return NextResponse.json({ saved: false });
}
