import { NextResponse } from 'next/server';

import { apiError, cleanString, readJson, requireUser } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/types/database';

interface ProfilePayload {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  notify_on_publish?: boolean;
}

export async function PATCH(request: Request) {
  const payload = await readJson<ProfilePayload>(request);
  const { user, error: authError } = await requireUser();

  if (authError) return authError;

  const update: TablesUpdate<'profiles'> = {};

  if (payload?.full_name !== undefined) {
    const fullName = cleanString(payload.full_name, 120);

    if (!fullName) return apiError('Your name cannot be empty.');

    update.full_name = fullName;
  }

  if (payload?.bio !== undefined) update.bio = cleanString(payload.bio, 600);
  if (payload?.avatar_url !== undefined) update.avatar_url = cleanString(payload.avatar_url, 1000);

  // The reader's alert preference is toggled on its own from the reading list,
  // so only the fields actually sent are updated.
  if (typeof payload?.notify_on_publish === 'boolean') update.notify_on_publish = payload.notify_on_publish;

  if (Object.keys(update).length === 0) return apiError('Nothing to update.');

  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').update(update).eq('id', user.id).select('*').single();

  if (error) return apiError('Your profile could not be updated.', 500);

  return NextResponse.json({ profile: data });
}
