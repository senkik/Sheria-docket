import { createClient } from '@/lib/supabase/server';
import { escapeHtml, isEmailConfigured, sendEmails, type OutboundEmail } from '@/lib/email';
import { CATEGORY_LABELS, SITE } from '@/lib/constants';
import { absoluteUrl, formatDate, postHref, truncate } from '@/lib/utils';
import type { PostCategory, ReviewNotice } from '@/types/database';

export interface AlertDispatchSummary {
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
  message?: string;
}

export interface AlertPost {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  citation: string | null;
  jurisdiction: string | null;
  published_at: string | null;
}

interface AlertRecipient {
  email: string | null;
  full_name: string | null;
}

function layout(heading: string, body: string) {
  return `<!doctype html>
<html lang="en-KE">
  <body style="margin:0;background:#f4f5f7;padding:24px;font-family:Helvetica,Arial,sans-serif;color:#0A192F;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0A192F;padding:20px 24px;">
        <p style="margin:0;color:#C8A951;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(SITE.name)}</p>
        <p style="margin:6px 0 0;color:#ffffff;font-size:16px;">${escapeHtml(heading)}</p>
      </div>
      <div style="padding:24px;">${body}</div>
      <div style="padding:16px 24px;background:#f9fafb;font-size:11px;color:#6b7280;line-height:1.6;">
        Educational information only; this is not legal advice.
      </div>
    </div>
  </body>
</html>`;
}

function button(href: string, text: string) {
  return `<p style="margin:0 0 24px;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#C8A951;color:#0A192F;padding:12px 20px;border-radius:6px;font-size:14px;font-weight:bold;text-decoration:none;">${escapeHtml(text)}</a></p>`;
}

function greeting(recipient: AlertRecipient) {
  return recipient.full_name ? `Hello ${recipient.full_name.split(' ')[0]},` : 'Hello,';
}

function byline(post: AlertPost) {
  return [post.jurisdiction, post.citation].filter(Boolean).join(' · ');
}

/** Readers get this when a brief in a topic they follow goes live. */
export function buildBriefAlert(post: AlertPost, recipient: AlertRecipient): OutboundEmail {
  const categoryLabel = CATEGORY_LABELS[post.category as PostCategory] ?? 'Brief';
  const url = absoluteUrl(postHref(post));
  const readingListUrl = absoluteUrl('/reading-list');
  const summary = post.excerpt ?? 'A new brief has been published in a topic you follow.';
  const meta = byline(post);

  const html = layout(
    'A brief you follow has been published',
    `
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">${escapeHtml(categoryLabel)}</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">
          <a href="${escapeHtml(url)}" style="color:#0A192F;text-decoration:none;">${escapeHtml(post.title)}</a>
        </h1>
        ${meta ? `<p style="margin:0 0 16px;font-size:13px;color:#6b7280;">${escapeHtml(meta)}</p>` : ''}
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(summary)}</p>
        ${button(url, 'Read the brief')}
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
          Published ${escapeHtml(formatDate(post.published_at))}. You are receiving this because you follow this topic on
          ${escapeHtml(SITE.name)}. <a href="${escapeHtml(readingListUrl)}" style="color:#0A192F;">Manage your reading list and alerts</a>.
        </p>`
  );

  const text = `${greeting(recipient)}

${categoryLabel}: ${post.title}

${summary}

Read it: ${url}
${meta ? `\n${meta}\n` : ''}
You are receiving this because you follow this topic on ${SITE.name}.
Manage your reading list and alerts: ${readingListUrl}

Educational information only; this is not legal advice.`;

  return {
    to: recipient.email ?? '',
    subject: `New brief: ${cleanSubject(post.title)}`,
    html,
    text
  };
}

/** Authors get this when the desk acts on their submission. */
export function buildReviewNotice(post: AlertPost, recipient: AlertRecipient, notice: ReviewNotice): OutboundEmail {
  const editUrl = absoluteUrl(`/dashboard/posts/${post.id}/edit`);
  const liveUrl = absoluteUrl(postHref(post));
  const notes = notice.notes?.trim();
  const editor = notice.editor_name ?? 'The editorial desk';

  const subjects: Record<string, string> = {
    published: `Published: ${cleanSubject(post.title)}`,
    changes_requested: `Changes requested: ${cleanSubject(post.title)}`,
    returned: `Returned to draft: ${cleanSubject(post.title)}`
  };

  const headlines: Record<string, string> = {
    published: 'Your brief is live',
    changes_requested: 'The desk has asked for changes',
    returned: 'Your submission is back in draft'
  };

  const intros: Record<string, string> = {
    published: `${editor} has published your brief on ${SITE.name}. It is live on the site now.`,
    changes_requested: `${editor} has read your submission and asked for changes before it can be published.`,
    returned: `${editor} has returned your submission to draft. It is no longer in the review queue.`
  };

  const decision = notice.decision;
  const subject = subjects[decision] ?? `Update on: ${cleanSubject(post.title)}`;
  const headline = headlines[decision] ?? 'An update on your submission';
  const intro = intros[decision] ?? `${editor} has updated your submission.`;

  const html = layout(
    'Editorial decision on your submission',
    `
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Editorial desk</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(headline)}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(intro)}</p>
        <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0A192F;"><strong>${escapeHtml(post.title)}</strong></p>
        ${
          byline(post)
            ? `<p style="margin:0 0 16px;font-size:13px;color:#6b7280;">${escapeHtml(byline(post))}</p>`
            : ''
        }
        ${
          notes
            ? `<div style="margin:0 0 20px;border-left:3px solid #C8A951;padding:4px 0 4px 16px;">
                 <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Notes from ${escapeHtml(editor)}</p>
                 <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;white-space:pre-line;">${escapeHtml(notes)}</p>
               </div>`
            : ''
        }
        ${decision === 'published' ? button(liveUrl, 'Read it on the site') : button(editUrl, 'Open the submission')}
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
          ${decision === 'published' ? `<a href="${escapeHtml(editUrl)}" style="color:#0A192F;">Edit the brief in your dashboard</a>.` : 'Revise the brief and submit it for review again from your dashboard.'}
        </p>`
  );

  const text = `${greeting(recipient)}

${headline}

${intro}

${post.title}
${byline(post) ? `${byline(post)}\n` : ''}${notes ? `\nNotes from ${editor}:\n${notes}\n` : ''}
${decision === 'published' ? `Read it: ${liveUrl}\nEdit it: ${editUrl}` : `Open the submission: ${editUrl}`}

Educational information only; this is not legal advice.`;

  return { to: recipient.email ?? '', subject, html, text };
}

/** A subject is a header, so newlines and control characters are stripped. */
function cleanSubject(title: string) {
  return truncate(
    title
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim(),
    120
  );
}

/**
 * Sends every pending message in the queue — reader brief alerts and author
 * review notices — and records the outcome on each row. Called with a staff
 * session, so Row Level Security lets it read and update rows belonging to
 * other people.
 */
export async function dispatchAlerts(options: { postId?: string; limit?: number } = {}): Promise<AlertDispatchSummary> {
  const { postId, limit = 200 } = options;
  const supabase = await createClient();

  let pendingQuery = supabase
    .from('notifications')
    .select('id, user_id, post_id, kind, payload, attempts')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (postId) pendingQuery = pendingQuery.eq('post_id', postId);

  const { data: pending, error } = await pendingQuery;

  if (error) throw new Error('The alert queue could not be read.');

  const rows = pending ?? [];
  const summary: AlertDispatchSummary = { queued: rows.length, sent: 0, failed: 0, skipped: 0 };

  if (rows.length === 0) return summary;

  const postIds = Array.from(new Set(rows.map((row) => row.post_id)));
  const userIds = Array.from(new Set(rows.map((row) => row.user_id)));

  const [{ data: postRows }, { data: readerRows }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, category, excerpt, citation, jurisdiction, published_at, status')
      .in('id', postIds),
    supabase.from('profiles').select('id, email, full_name, notify_on_publish').in('id', userIds)
  ]);

  const posts = new Map((postRows ?? []).map((post) => [post.id, post]));
  const readers = new Map((readerRows ?? []).map((reader) => [reader.id, reader]));

  const outbound: { id: string; attempts: number; email: OutboundEmail }[] = [];
  const skippedByReason = new Map<string, string[]>();

  function skip(id: string, reason: string) {
    const ids = skippedByReason.get(reason) ?? [];
    ids.push(id);
    skippedByReason.set(reason, ids);
  }

  for (const row of rows) {
    const post = posts.get(row.post_id);
    const recipient = readers.get(row.user_id);
    const address = recipient?.email?.trim();

    if (!post) {
      skip(row.id, 'The brief no longer exists.');
      continue;
    }

    if (!address) {
      skip(row.id, 'No email address on file.');
      continue;
    }

    if (row.kind === 'new_brief') {
      if (post.status !== 'published') {
        skip(row.id, 'The brief is no longer published.');
        continue;
      }

      if (!recipient?.notify_on_publish) {
        skip(row.id, 'The reader has paused brief alerts.');
        continue;
      }

      outbound.push({
        id: row.id,
        attempts: row.attempts,
        email: buildBriefAlert(post, { email: address, full_name: recipient?.full_name ?? null })
      });
      continue;
    }

    if (row.kind === 'review_decision') {
      const payload = (row.payload ?? null) as ReviewNotice | null;

      if (!payload?.decision || payload.decision === 'assigned') {
        skip(row.id, 'No notice is due for that decision.');
        continue;
      }

      outbound.push({
        id: row.id,
        attempts: row.attempts,
        email: buildReviewNotice(post, { email: address, full_name: recipient?.full_name ?? null }, payload)
      });
      continue;
    }

    skip(row.id, `Unknown message kind: ${row.kind}`);
  }

  const now = new Date().toISOString();

  if (outbound.length > 0) {
    const outcomes = await sendEmails(outbound.map((item) => item.email));
    const sentIds: string[] = [];

    for (let index = 0; index < outbound.length; index += 1) {
      const item = outbound[index];
      const outcome = outcomes[index];

      if (outcome?.ok) {
        sentIds.push(item.id);
        continue;
      }

      const message = outcome?.error ?? 'Email delivery failed.';
      await supabase
        .from('notifications')
        .update({ status: 'failed', attempts: item.attempts + 1, last_error: message })
        .eq('id', item.id);

      summary.failed += 1;
    }

    if (sentIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ status: 'sent', sent_at: now, attempts: 1, last_error: null })
        .in('id', sentIds);

      summary.sent = sentIds.length;
    }
  }

  for (const [reason, ids] of skippedByReason) {
    await supabase.from('notifications').update({ status: 'skipped', last_error: reason }).in('id', ids);
    summary.skipped += ids.length;
  }

  if (summary.failed > 0 && !isEmailConfigured()) {
    summary.message = 'Alerts are queued but not delivered: set RESEND_API_KEY and NOTIFICATIONS_FROM_EMAIL.';
  } else if (summary.failed > 0) {
    summary.message = 'Some alerts could not be delivered. Check the sender address and try again.';
  }

  return summary;
}
