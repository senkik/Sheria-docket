import { NextResponse, type NextRequest } from 'next/server';

import { apiError, cleanString, readJson, requireRole } from '@/lib/api';
import { canPublish } from '@/lib/auth';
import { dispatchAlerts } from '@/lib/notifications';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import type { TablesInsert, TablesUpdate } from '@/types/database';

const CONTENT_ROLES = ['admin', 'editor', 'author'] as const;
const STATUSES = ['draft', 'pending_review', 'published'];
const CATEGORIES = ['case_brief', 'student_guide', 'county_update', 'know_your_law', 'opinion'];

interface PostPayload {
  id?: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  jurisdiction?: string;
  area_of_law?: string;
  status?: string;
  cover_image_url?: string;
  citation?: string;
  bench?: string;
  facts?: string;
  issues?: string;
  holding?: string;
  obiter?: string;
  pdf_url?: string;
}

function buildFields(payload: PostPayload) {
  return {
    title: cleanString(payload.title, 240),
    slug: cleanString(payload.slug, 200),
    content: cleanString(payload.content, 60000),
    excerpt: cleanString(payload.excerpt, 600),
    category: cleanString(payload.category, 40),
    jurisdiction: cleanString(payload.jurisdiction, 120),
    area_of_law: cleanString(payload.area_of_law, 80),
    status: cleanString(payload.status, 20),
    cover_image_url: cleanString(payload.cover_image_url, 1000),
    citation: cleanString(payload.citation, 120),
    bench: cleanString(payload.bench, 400),
    facts: cleanString(payload.facts, 10000),
    issues: cleanString(payload.issues, 10000),
    holding: cleanString(payload.holding, 10000),
    obiter: cleanString(payload.obiter, 10000),
    pdf_url: cleanString(payload.pdf_url, 1000)
  };
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const supabase = await createClient();
  const seed = base || 'untitled-brief';

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? seed : `${seed}-${attempt + 1}`;
    const { data } = await supabase.from('posts').select('id').eq('slug', candidate).maybeSingle();

    if (!data || data.id === ignoreId) return candidate;
  }

  return `${seed}-${Date.now()}`;
}

/**
 * Readers following a topic the brief matches get an email. The queue itself is
 * written by the on_post_published trigger; this only delivers what is pending,
 * so a mail problem never turns a successful publish into an error.
 */
async function deliverReaderAlerts(postId: string) {
  try {
    return await dispatchAlerts({ postId });
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { profile, error: authError } = await requireRole([...CONTENT_ROLES]);
  if (authError) return authError;

  const payload = await readJson<PostPayload>(request);
  if (!payload) return apiError('Invalid request body.');

  const fields = buildFields(payload);

  if (!fields.title) return apiError('A title is required.');
  if (fields.category && !CATEGORIES.includes(fields.category)) return apiError('Unknown category.');

  const status = fields.status && STATUSES.includes(fields.status) ? fields.status : 'draft';

  if (status === 'published' && !canPublish(profile.role)) {
    return apiError('Authors submit briefs for review. An editor publishes them.', 403);
  }

  const slug = await uniqueSlug(slugify(fields.slug || fields.title));
  const supabase = await createClient();

  const insert: TablesInsert<'posts'> = {
    author_id: profile.id,
    title: fields.title,
    slug,
    content: fields.content,
    excerpt: fields.excerpt,
    category: fields.category,
    jurisdiction: fields.jurisdiction,
    area_of_law: fields.area_of_law,
    status,
    cover_image_url: fields.cover_image_url,
    citation: fields.citation,
    bench: fields.bench,
    facts: fields.facts,
    issues: fields.issues,
    holding: fields.holding,
    obiter: fields.obiter,
    pdf_url: fields.pdf_url,
    published_at: status === 'published' ? new Date().toISOString() : null
  };

  const { data, error } = await supabase.from('posts').insert(insert).select('id, slug, status').single();

  if (error) return apiError('The post could not be created.', 500);

  const alerts = status === 'published' ? await deliverReaderAlerts(data.id) : null;

  return NextResponse.json({ post: data, alerts }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { profile, error: authError } = await requireRole([...CONTENT_ROLES]);
  if (authError) return authError;

  const payload = await readJson<PostPayload>(request);
  const id = payload?.id;

  if (!id) return apiError('A post id is required.');

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('posts')
    .select('id, author_id, status, published_at, slug')
    .eq('id', id)
    .maybeSingle();

  if (!existing) return apiError('Post not found.', 404);

  const isOwner = existing.author_id === profile.id;
  const isStaff = profile.role === 'admin' || profile.role === 'editor';

  if (!isOwner && !isStaff) return apiError('You can only edit your own posts.', 403);

  const fields = buildFields(payload);
  const status = fields.status && STATUSES.includes(fields.status) ? fields.status : existing.status;

  if (status !== existing.status && status === 'published' && !canPublish(profile.role)) {
    return apiError('Authors submit briefs for review. An editor publishes them.', 403);
  }

  if (fields.category && !CATEGORIES.includes(fields.category)) return apiError('Unknown category.');

  const update: TablesUpdate<'posts'> = {
    updated_at: new Date().toISOString()
  };

  if (fields.title) update.title = fields.title;
  if (fields.content !== null) update.content = fields.content;
  if (fields.excerpt !== null) update.excerpt = fields.excerpt;
  if (fields.category) update.category = fields.category;
  if (fields.jurisdiction !== null) update.jurisdiction = fields.jurisdiction;
  if (fields.area_of_law !== null) update.area_of_law = fields.area_of_law;
  if (fields.cover_image_url !== null) update.cover_image_url = fields.cover_image_url;
  if (fields.citation !== null) update.citation = fields.citation;
  if (fields.bench !== null) update.bench = fields.bench;
  if (fields.facts !== null) update.facts = fields.facts;
  if (fields.issues !== null) update.issues = fields.issues;
  if (fields.holding !== null) update.holding = fields.holding;
  if (fields.obiter !== null) update.obiter = fields.obiter;
  if (fields.pdf_url !== null) update.pdf_url = fields.pdf_url;

  update.status = status;
  if (status === 'published' && !existing.published_at) update.published_at = new Date().toISOString();

  const becamePublished = status === 'published' && existing.status !== 'published';

  const { data, error } = await supabase.from('posts').update(update).eq('id', id).select('id, slug, status').single();

  if (error) return apiError('The post could not be updated.', 500);

  const alerts = becamePublished ? await deliverReaderAlerts(id) : null;

  return NextResponse.json({ post: data, alerts });
}

export async function DELETE(request: NextRequest) {
  const { profile, error: authError } = await requireRole([...CONTENT_ROLES]);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return apiError('A post id is required.');

  const supabase = await createClient();
  const { data: existing } = await supabase.from('posts').select('id, author_id, status').eq('id', id).maybeSingle();

  if (!existing) return apiError('Post not found.', 404);

  const isOwner = existing.author_id === profile.id;
  const isStaff = profile.role === 'admin' || profile.role === 'editor';

  if (!isOwner && !isStaff) return apiError('You can only delete your own posts.', 403);
  if (isOwner && !isStaff && existing.status === 'published') {
    return apiError('Published posts can only be removed by an editor.', 403);
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) return apiError('The post could not be deleted.', 500);

  return NextResponse.json({ deleted: id });
}
