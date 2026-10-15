import { NextResponse, type NextRequest } from 'next/server';

import { apiError, readJson, requireRole } from '@/lib/api';
import { dispatchAlerts } from '@/lib/notifications';

interface DispatchPayload {
  post_id?: string;
  limit?: number;
}

/**
 * Sends queued reader alerts. Run automatically when a brief is published
 * through /api/posts, and from the editorial dashboard to clear the queue after
 * publishing straight from the database or to retry failed deliveries.
 */
export async function POST(request: NextRequest) {
  const { error: authError } = await requireRole(['admin', 'editor']);
  if (authError) return authError;

  const payload = await readJson<DispatchPayload>(request);
  const requestedLimit = typeof payload?.limit === 'number' ? Math.floor(payload.limit) : 200;
  const limit = Math.min(Math.max(requestedLimit, 1), 200);

  try {
    const summary = await dispatchAlerts({ postId: payload?.post_id?.trim(), limit });

    return NextResponse.json({ summary });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'The alert queue could not be dispatched.', 500);
  }
}
