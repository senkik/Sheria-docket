import { NextResponse, type NextRequest } from 'next/server';

import { apiError, cleanString, readJson, requireUser } from '@/lib/api';
import { CATEGORIES, FOLLOW_KINDS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import type { FollowKind } from '@/types/database';

interface FollowPayload {
  kind?: string;
  value?: string;
}

function normalise(kind: string | null, value: string | null) {
  if (!kind || !FOLLOW_KINDS.includes(kind as FollowKind)) return null;

  if (kind === 'category') {
    const known = CATEGORIES.some((category) => category.value === value);
    if (!known) return null;
  }

  return { kind, value: value as string };
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const payload = await readJson<FollowPayload>(request);
  const topic = normalise(cleanString(payload?.kind, 40), cleanString(payload?.value, 160));

  if (!topic) return apiError('That is not a topic a reader can follow.');

  const supabase = await createClient();
  const { error } = await supabase.from('follows').insert({ user_id: user.id, kind: topic.kind, value: topic.value });

  // Following a topic twice is success, not an error.
  if (error && error.code !== '23505') {
    return apiError('Could not follow that topic.', 500);
  }

  return NextResponse.json({ following: true, topic }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const kind = request.nextUrl.searchParams.get('kind');
  const value = cleanString(request.nextUrl.searchParams.get('value'), 160);
  const topic = normalise(kind, value);

  if (!topic) return apiError('That is not a topic a reader can follow.');

  const supabase = await createClient();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('user_id', user.id)
    .eq('kind', topic.kind)
    .eq('value', topic.value);

  if (error) return apiError('Could not unfollow that topic.', 500);

  return NextResponse.json({ following: false, topic });
}
