import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, Mail } from 'lucide-react';

import { DispatchButton } from '@/components/DispatchButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { canPublish, requireProfile } from '@/lib/auth';
import { ALERT_STATUS_LABELS, CATEGORY_LABELS, NOTIFICATION_KIND_LABELS } from '@/lib/constants';
import { isEmailConfigured } from '@/lib/email';
import { getAlertCounts, getAlertQueue } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

export const metadata: Metadata = {
  title: 'Email alerts',
  robots: { index: false, follow: false }
};

function statusStyles(status: string) {
  if (status === 'sent') return { variant: 'success' as const, className: '' };
  if (status === 'failed') return { variant: 'outline' as const, className: 'border-destructive text-destructive' };
  if (status === 'pending') return { variant: 'warning' as const, className: '' };

  return { variant: 'muted' as const, className: '' };
}

export default async function AlertsPage() {
  const profile = await requireProfile('/dashboard/alerts');

  if (!canPublish(profile.role)) redirect('/dashboard');

  const [rows, counts] = await Promise.all([getAlertQueue(100), getAlertCounts()]);
  const emailConfigured = isEmailConfigured();

  const metrics = [
    { label: 'Queued', value: counts.pending, icon: Clock, hint: 'Waiting to be sent' },
    { label: 'Sent', value: counts.sent, icon: CheckCircle2, hint: 'Delivered to readers' },
    { label: 'Failed', value: counts.failed, icon: AlertTriangle, hint: 'Retry from here' }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Email alerts</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            When a brief is published, every reader following one of its topics is queued an alert and emailed straight
            away. Use this page after publishing outside the dashboard, or to retry a failed delivery.
          </p>
        </div>

        <DispatchButton />
      </header>

      {!emailConfigured ? (
        <p className="rounded-lg border border-gold/40 bg-accent/5 px-4 py-3 text-sm text-gold-dark">
          <Mail className="mr-2 inline h-4 w-4" />
          Alerts are being queued but cannot be delivered yet. Set <code>RESEND_API_KEY</code> and{' '}
          <code>NOTIFICATIONS_FROM_EMAIL</code> to start sending.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy/5 text-navy dark:bg-white/10 dark:text-foreground">
                <metric.icon className="h-4 w-4" />
              </span>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="font-serif text-3xl">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Recent alerts</h2>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No alerts yet. Publish a brief and the readers following it will appear here.
          </p>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Brief</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Detail</TableHead>
                  <TableHead className="hidden md:table-cell">Queued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const badge = statusStyles(row.status);

                  return (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[200px]">
                      <span className="block font-medium">{row.reader?.full_name ?? 'Reader'}</span>
                      <span className="block truncate text-xs text-muted-foreground">{row.reader?.email ?? '—'}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {NOTIFICATION_KIND_LABELS[row.kind] ?? row.kind}
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      {row.post ? (
                        <>
                          <Link
                            href={`/dashboard/posts/${row.post.id}/edit`}
                            className="font-medium hover:text-gold-dark"
                          >
                            {row.post.title}
                          </Link>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {CATEGORY_LABELS[row.post.category as PostCategory] ?? 'Article'}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Deleted brief</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant} className={badge.className}>
                        {ALERT_STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                      {row.attempts > 1 ? (
                        <span className="mt-1 block text-xs text-muted-foreground">{row.attempts} attempts</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden max-w-[260px] text-xs text-muted-foreground lg:table-cell">
                      {row.status === 'sent' && row.sent_at
                        ? `Sent ${formatDate(row.sent_at, true)}`
                        : row.last_error ?? '—'}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                      {formatDate(row.created_at, true)}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
