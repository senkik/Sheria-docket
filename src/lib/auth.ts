import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/types/database';

const CONTENT_ROLES: UserRole[] = ['admin', 'editor', 'author'];

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (data) return data;

  // A profile is created by the handle_new_user trigger on signup. If a user
  // exists without one, fall back to the auth record so the UI still renders.
  return {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? null,
    email: user.email ?? null,
    role: 'reader',
    bio: null,
    avatar_url: null,
    notify_on_publish: true,
    created_at: user.created_at
  };
}

/** Sends anonymous visitors to the login page, preserving where they were headed. */
export async function requireProfile(nextPath = '/dashboard') {
  const profile = await getCurrentProfile();

  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  return profile;
}

/** Editors and admins may publish; authors must go through review. */
export function canPublish(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

export function canManageUsers(role: string): boolean {
  return role === 'admin';
}

export function canManageTaxonomy(role: string): boolean {
  return role === 'admin';
}

export function canCreateContent(role: string): boolean {
  return CONTENT_ROLES.includes(role as UserRole);
}

/** Editors and admins can act on posts they did not write. */
export function canEditAnyPost(role: string): boolean {
  return role === 'admin' || role === 'editor';
}
