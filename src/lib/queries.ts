import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import { followKey } from '@/lib/utils';
import type {
  CommentWithAuthor,
  Follow,
  Internship,
  PostReviewWithEditor,
  PostStatus,
  PostWithAuthor,
  Profile,
  Resource,
  SubmissionWithPeople
} from '@/types/database';

/**
 * Posts carry two foreign keys to profiles (author and assigned editor), so both
 * embeds name their relationship: PostgREST refuses an ambiguous embed and would
 * otherwise fail every post query.
 */
const POST_SELECT = '*, profiles!posts_author_id_fkey(id, full_name, avatar_url)';
const COMMENT_SELECT = '*, profiles(id, full_name, avatar_url)';
const SUBMISSION_SELECT = `${POST_SELECT}, editor:profiles!posts_assigned_editor_id_fkey(id, full_name)`;

/**
 * A failed query used to look like an empty page. Logging it means a schema or
 * embed mistake shows up in the server log instead of a silently blank site.
 */
function queryFailed(scope: string, error: unknown) {
  console.error(`[sheria] ${scope} query failed:`, error);
}

export interface PostFilters {
  q?: string;
  category?: string;
  jurisdiction?: string;
  area?: string;
  year?: string;
  limit?: number;
}


export async function getPublishedPosts(options: { limit?: number; category?: string } = {}) {
  const supabase = await createClient();
  const { limit = 9, category } = options;

  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    queryFailed('posts', error);
    return [] as PostWithAuthor[];
  }

  return (data ?? []) as unknown as PostWithAuthor[];
}

export async function getFeaturedPost() {
  const supabase = await createClient();

  // Prefer a brief with artwork so the homepage hero card has a visual anchor.
  const { data: withImage } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .not('cover_image_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (withImage) return withImage as unknown as PostWithAuthor;

  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as unknown as PostWithAuthor) ?? null;
}

export async function getPostsByFilters(filters: PostFilters = {}) {
  const supabase = await createClient();
  const { q, category, jurisdiction, area, year, limit = 30 } = filters;

  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (q) {
    // Commas and parentheses would break the PostgREST or() syntax.
    const term = q.replace(/[%,()]/g, ' ').trim();
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,citation.ilike.%${term}%`);
  }

  if (category && category !== 'all') query = query.eq('category', category);
  if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);
  if (area) query = query.eq('area_of_law', area);

  if (year) {
    query = query
      .gte('published_at', `${year}-01-01T00:00:00.000Z`)
      .lt('published_at', `${Number(year) + 1}-01-01T00:00:00.000Z`);
  }

  const { data, error } = await query;
  if (error) {
    queryFailed('posts', error);
    return [] as PostWithAuthor[];
  }

  return (data ?? []) as unknown as PostWithAuthor[];
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('posts').select(POST_SELECT).eq('slug', slug).maybeSingle();

  return (data as unknown as PostWithAuthor) ?? null;
}

export async function getPostById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle();

  return (data as unknown as PostWithAuthor) ?? null;
}

export async function getPostsByAuthor(authorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false });

  if (error) {
    queryFailed('posts', error);
    return [] as PostWithAuthor[];
  }

  return (data ?? []) as unknown as PostWithAuthor[];
}

/** Editors and admins review the whole queue; authors see only their own work. */
export async function getPostsForReview(profile: Profile) {
  const supabase = await createClient();

  if (profile.role === 'author') return getPostsByAuthor(profile.id);

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('updated_at', { ascending: false });

  if (error) {
    queryFailed('posts', error);
    return [] as PostWithAuthor[];
  }

  return (data ?? []) as unknown as PostWithAuthor[];
}

export async function getRelatedPosts(post: PostWithAuthor, limit = 3) {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .neq('id', post.id)
    .limit(limit);

  if (post.area_of_law) query = query.eq('area_of_law', post.area_of_law);
  else if (post.category) query = query.eq('category', post.category);

  const { data, error } = await query;
  if (error) {
    queryFailed('posts', error);
    return [] as PostWithAuthor[];
  }

  return (data ?? []) as unknown as PostWithAuthor[];
}

export async function getComments(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    queryFailed('comments', error);
    return [] as CommentWithAuthor[];
  }

  return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function getPublishedYears() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('published_at')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(500);

  if (error) {
    queryFailed('post facets', error);
    return [] as string[];
  }

  const years = new Set<string>();
  data.forEach((row) => {
    if (row.published_at) years.add(String(new Date(row.published_at).getFullYear()));
  });

  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export async function getJurisdictions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('jurisdiction')
    .eq('status', 'published')
    .not('jurisdiction', 'is', null)
    .limit(500);

  if (error) {
    queryFailed('post facets', error);
    return [] as string[];
  }

  const values = new Set<string>();
  data.forEach((row) => {
    if (row.jurisdiction) values.add(row.jurisdiction);
  });

  return Array.from(values).sort();
}

export async function getResources() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    queryFailed('resources', error);
    return [] as Resource[];
  }

  return data ?? [];
}

export async function getInternships() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false });

  if (error) {
    queryFailed('internships', error);
    return [] as Internship[];
  }

  return data ?? [];
}

/**
 * The reader's saved brief ids, plus whether anyone is signed in, so list pages
 * can render a save control that is either ready to use or points at sign-in.
 */
export const getReaderBookmarks = cache(async (): Promise<{ signedIn: boolean; ids: Set<string> }> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { signedIn: false, ids: new Set<string>() };

  const { data, error } = await supabase.from('bookmarks').select('post_id');

  if (error) return { signedIn: true, ids: new Set<string>() };

  return { signedIn: true, ids: new Set((data ?? []).map((row) => row.post_id)) };
});

/** The ids of every brief the signed-in reader has saved, for card affordances. */
export async function getBookmarkedIds(): Promise<Set<string>> {
  const { ids } = await getReaderBookmarks();

  return ids;
}

/** The reader's reading list, most recently saved first. */
export async function getBookmarkedPosts(): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from('bookmarks')
    .select('post_id, created_at')
    .order('created_at', { ascending: false });

  if (error || !rows?.length) return [];

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .in('id', rows.map((row) => row.post_id));

  if (postsError) return [];

  const byId = new Map(((posts ?? []) as unknown as PostWithAuthor[]).map((post) => [post.id, post]));

  return rows
    .map((row) => byId.get(row.post_id))
    .filter((post): post is PostWithAuthor => Boolean(post));
}

/** Every topic the signed-in reader follows. */
export const getFollows = cache(async (): Promise<Follow[]> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  return data ?? [];
});

/** Followed topics as `kind:value` keys, so a follow control can render its state. */
export const getFollowKeys = cache(async (): Promise<Set<string>> => {
  const follows = await getFollows();

  return new Set(follows.map((follow) => followKey(follow.kind, follow.value)));
});

export interface AlertQueueRow {
  id: string;
  kind: string;
  status: string;
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  post: { id: string; title: string; slug: string; category: string | null } | null;
  reader: { id: string; full_name: string | null; email: string | null } | null;
}

/** The alert delivery log, newest first, for the editorial dashboard. */
export async function getAlertQueue(limit = 100): Promise<AlertQueueRow[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from('notifications')
    .select('id, user_id, post_id, kind, status, attempts, last_error, sent_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !rows?.length) return [];

  const postIds = Array.from(new Set(rows.map((row) => row.post_id)));
  const userIds = Array.from(new Set(rows.map((row) => row.user_id)));

  const [{ data: posts }, { data: readers }] = await Promise.all([
    supabase.from('posts').select('id, title, slug, category').in('id', postIds),
    supabase.from('profiles').select('id, full_name, email').in('id', userIds)
  ]);

  const postById = new Map((posts ?? []).map((post) => [post.id, post]));
  const readerById = new Map((readers ?? []).map((reader) => [reader.id, reader]));

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    status: row.status,
    attempts: row.attempts,
    last_error: row.last_error,
    sent_at: row.sent_at,
    created_at: row.created_at,
    post: postById.get(row.post_id) ?? null,
    reader: readerById.get(row.user_id) ?? null
  }));
}

export async function getAlertCounts() {
  const supabase = await createClient();

  const [pending, failed, sent] = await Promise.all([
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'sent')
  ]);

  return {
    pending: pending.count ?? 0,
    failed: failed.count ?? 0,
    sent: sent.count ?? 0
  };
}

/** Submissions waiting on the desk, oldest first, with author and reviewer. */
export async function getReviewQueue(): Promise<SubmissionWithPeople[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(SUBMISSION_SELECT)
    .eq('status', 'pending_review')
    .order('updated_at', { ascending: true });

  if (error) {
    queryFailed('review queue', error);
    return [];
  }

  return (data ?? []) as unknown as SubmissionWithPeople[];
}

/** One submission with its author and the editor who owns the review. */
export async function getSubmissionById(id: string): Promise<SubmissionWithPeople | null> {
  const supabase = await createClient();  const { data, error } = await supabase.from('posts').select(SUBMISSION_SELECT).eq('id', id).maybeSingle();

  if (error) {
    queryFailed('submission', error);
    return null;
  }

  if (!data) return null;

  return data as unknown as SubmissionWithPeople;
}

/** Every editorial decision on one submission, newest first. */
export async function getReviewsForPost(postId: string): Promise<PostReviewWithEditor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('post_reviews')
    .select('*, profiles(id, full_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    queryFailed('post reviews', error);
    return [];
  }

  return (data ?? []) as unknown as PostReviewWithEditor[];
}

/** The most recent decision per post, for the post lists. */
export async function getLatestReviews(postIds: string[]): Promise<Map<string, PostReviewWithEditor>> {
  const latest = new Map<string, PostReviewWithEditor>();

  if (postIds.length === 0) return latest;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('post_reviews')
    .select('*, profiles(id, full_name)')
    .in('post_id', postIds)
    .order('created_at', { ascending: false });

  if (error) return latest;

  for (const review of (data ?? []) as unknown as PostReviewWithEditor[]) {
    if (!latest.has(review.post_id)) latest.set(review.post_id, review);
  }

  return latest;
}

export async function getProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

  if (error) return [] as Profile[];

  return data ?? [];
}

export interface DashboardStats {
  posts: number;
  published: number;
  pending: number;
  changesRequested: number;
  drafts: number;
  comments: number;
  subscribers: number;
  readers: number;
}

export async function getDashboardStats(profile: Profile): Promise<DashboardStats> {
  const supabase = await createClient();
  const scoped = profile.role === 'author';

  const postsQuery = supabase.from('posts').select('status');
  const { data: postRows } = scoped
    ? await postsQuery.eq('author_id', profile.id)
    : await postsQuery;

  const rows = postRows ?? [];
  const countByStatus = (status: PostStatus) => rows.filter((row) => row.status === status).length;

  const { count: commentCount } = await supabase.from('comments').select('id', { count: 'exact', head: true });

  const stats: DashboardStats = {
    posts: rows.length,
    published: countByStatus('published'),
    pending: countByStatus('pending_review'),
    changesRequested: countByStatus('changes_requested'),
    drafts: countByStatus('draft'),
    comments: commentCount ?? 0,
    subscribers: 0,
    readers: 0
  };

  if (profile.role === 'admin') {
    const { count: subscriberCount } = await supabase
      .from('subscribers')
      .select('id', { count: 'exact', head: true });
    const { count: readerCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });

    stats.subscribers = subscriberCount ?? 0;
    stats.readers = readerCount ?? 0;
  }

  return stats;
}
