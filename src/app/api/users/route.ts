import { NextResponse, type NextRequest } from 'next/server';

import { apiError, readJson, requireRole } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

const ROLES: UserRole[] = ['admin', 'editor', 'author', 'reader'];

interface RolePayload {
  id?: string;
  role?: string;
}

export async function PATCH(request: NextRequest) {
  const { profile, error: authError } = await requireRole(['admin']);
  if (authError) return authError;

  const payload = await readJson<RolePayload>(request);
  const { id, role } = payload ?? {};

  if (!id || !role) return apiError('A user id and role are required.');
  if (!ROLES.includes(role as UserRole)) return apiError('Unknown role.');
  if (id === profile.id) return apiError('You cannot change your own role.', 400);

  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select('*').single();

  if (error) return apiError('The role could not be updated.', 500);

  return NextResponse.json({ profile: data });
}
