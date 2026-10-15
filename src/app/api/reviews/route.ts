import { NextResponse, type NextRequest } from 'next/server';

import { apiError, cleanString, readJson, requireRole } from '@/lib/api';
import { dispatchAlerts } from '@/lib/notifications';
import { createClient } from '@/lib/supabase/server';
import type { ReviewDecision, TablesUpdate } from '@/types/database';

interface ReviewPayload {
  post_id?: string;
  decision?: string;
  notes?: string;
}

const DECISIONS: ReviewDecision[] = ['assigned', 'changes_requested', 'published', 'returned'];

/** An assignment is bookkeeping; the other decisions move the submission. */
function statusFor(decision: ReviewDecision) {
  switch (decision) {
    case 'published':
      return 'published';
    case 'changes_requested':
      return 'changes_requested';
    case 'returned':
      return 'draft';
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const { profile, error: authError } = await requireRole(['admin', 'editor']);
  if (authError) return authError;

  const payload = await readJson<ReviewPayload>(request);
  const postId = payload?.post_id?.trim();
  const decision = payload?.decision as ReviewDecision | undefined;
  const notes = cleanString(payload?.notes, 4000);

  if (!postId) return apiError('A submission id is required.');
  if (!decision || !DECISIONS.includes(decision)) return apiError('Unknown review decision.');

  if (decision === 'changes_requested' && (!notes || notes.length < 5)) {
    return apiError('Tell the author what needs changing before sending it back.');
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('posts')
    .select('id, slug, status, author_id, published_at')
    .eq('id', postId)
    .maybeSingle();

  if (!existing) return apiError('Submission not found.', 404);

  const nextStatus = statusFor(decision);
  const now = new Date().toISOString();

  const update: TablesUpdate<'posts'> = { updated_at: now };

  if (decision === 'assigned') update.assigned_editor_id = profile.id;

  if (nextStatus) {
    update.status = nextStatus;
    if (nextStatus === 'published' && !existing.published_at) update.published_at = now;
  }

  const { error: updateError } = await supabase.from('posts').update(update).eq('id', postId);

  if (updateError) return apiError('The submission could not be updated.', 500);

  const { data: review, error: reviewError } = await supabase
    .from('post_reviews')
    .insert({
      post_id: postId,
      editor_id: profile.id,
      decision,
      notes
    })
    .select('id')
    .single();

  if (reviewError || !review) return apiError('The decision was saved but the review trail could not be recorded.', 500);

  // The author hears about every decision except an assignment, which is
  // internal bookkeeping. Publishing also queues reader alerts through the
  // on_post_published trigger, so one dispatch covers both audiences.
  if (decision !== 'assigned' && existing.author_id) {
    // The queue is unique on (user, brief, kind, dedupe key), so repeating the
    // same decision with the same notes queues one notice, while a fresh round
    // of feedback still reaches the author.
    const { error: noticeError } = await supabase.from('notifications').upsert(
      {
        user_id: existing.author_id,
        post_id: postId,
        kind: 'review_decision',
        dedupe_key: `${decision}:${notes ?? ''}`,
        payload: { decision, notes, editor_name: profile.full_name ?? profile.email }
      },
      { onConflict: 'user_id,post_id,kind,dedupe_key', ignoreDuplicates: true }
    );

    if (noticeError) return apiError('The decision was recorded but the author could not be notified.', 500);
  }

  let alerts = null;

  if (decision !== 'assigned') {
    try {
      alerts = await dispatchAlerts({ postId });
    } catch {
      // Delivery problems are visible on the Email alerts page; the decision stands.
      alerts = null;
    }
  }

  return NextResponse.json({
    post: { id: postId, slug: existing.slug, status: nextStatus ?? existing.status },
    decision,
    alerts
  });
}
