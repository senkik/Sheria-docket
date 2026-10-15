import { NextResponse } from 'next/server';

import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/types/database';

type RoleResult = { profile: Profile; error: null } | { profile: null; error: NextResponse };

export function apiError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function requireRole(allowed: UserRole[]): Promise<RoleResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    return { profile: null, error: apiError('You must be signed in to do that.', 401) };
  }

  if (!allowed.includes(profile.role as UserRole)) {
    return { profile: null, error: apiError('Your role does not permit this action.', 403) };
  }

  return { profile, error: null };
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { user: null, error: apiError('You must be signed in to do that.', 401) };

  return { user, error: null };
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function cleanString(value: unknown, maxLength = 5000) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.slice(0, maxLength);
}
