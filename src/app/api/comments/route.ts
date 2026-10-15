import { NextResponse } from 'next/server';

import { apiError, readJson, requireUser } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

interface CommentPayload {
  post_id?: string;
  content?: string;
}

export async function POST(request: Request) {
  const payload = await readJson<CommentPayload>(request);
  const { user, error: authError } = await requireUser();

  if (authError) return authError;

  const postId = payload?.post_id;
  const content = payload?.content?.trim();

  if (!postId) return apiError('A comment must belong to an article.');
  if (!content || content.length < 3) return apiError('Write at least a few words.');
  if (content.length > 4000) return apiError('Comments are limited to 4000 characters.');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content })
    .select('id, post_id, user_id, content, created_at')
    .single();

  if (error) return apiError('Your comment could not be saved.', 500);

  return NextResponse.json({ comment: data }, { status: 201 });
}
