/**
 * Email delivery for reader alerts.
 *
 * Everything goes through Resend's REST API in a single batched POST, so no SDK
 * or extra runtime dependency is needed. When RESEND_API_KEY is absent the
 * caller gets a per-recipient failure rather than a throw: a publish must never
 * fail because email is not configured yet.
 */

export interface OutboundEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendOutcome {
  ok: boolean;
  error?: string;
}

const BATCH_ENDPOINT = 'https://api.resend.com/emails/batch';
const BATCH_SIZE = 100;

/** Without a verified domain Resend only accepts mail from its own test sender. */
export function alertFromAddress() {
  const configured = process.env.NOTIFICATIONS_FROM_EMAIL?.trim();

  return configured || 'Sheria Docket <onboarding@resend.dev>';
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/**
 * Sends every email and returns one outcome per email, in the same order.
 * A rejected batch fails every email in that batch with the provider message.
 */
export async function sendEmails(emails: OutboundEmail[]): Promise<SendOutcome[]> {
  const outcomes: SendOutcome[] = emails.map(() => ({ ok: false }));

  if (emails.length === 0) return outcomes;

  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return outcomes.map(() => ({
      ok: false,
      error: 'RESEND_API_KEY is not set, so no alert could be delivered.'
    }));
  }

  const from = alertFromAddress();

  for (let start = 0; start < emails.length; start += BATCH_SIZE) {
    const batch = emails.slice(start, start + BATCH_SIZE);

    try {
      const response = await fetch(BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          batch.map((email) => ({
            from,
            to: [email.to],
            subject: email.subject,
            html: email.html,
            text: email.text
          }))
        )
      });

      if (!response.ok) {
        const detail = (await response.text().catch(() => '')).slice(0, 300);
        const message = `Resend rejected the batch (HTTP ${response.status})${detail ? `: ${detail}` : ''}`;

        batch.forEach((_, index) => {
          outcomes[start + index] = { ok: false, error: message };
        });

        continue;
      }

      batch.forEach((_, index) => {
        outcomes[start + index] = { ok: true };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email delivery failed.';

      batch.forEach((_, index) => {
        outcomes[start + index] = { ok: false, error: message };
      });
    }
  }

  return outcomes;
}

export function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
