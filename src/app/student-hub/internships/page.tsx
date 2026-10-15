import type { Metadata } from 'next';
import { Building2, CalendarClock, ExternalLink, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getInternships } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Internship & Pupillage Board',
  description:
    'Current internships, attachments and pupillage openings for Kenyan law students at firms, county offices and legal aid organisations.'
};

function deadlineBadge(deadline: string | null) {
  if (!deadline) return null;

  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);

  if (days < 0) return <Badge variant="muted">Closed</Badge>;
  if (days <= 14) return <Badge variant="warning">Closes in {days} {days === 1 ? 'day' : 'days'}</Badge>;

  return <Badge variant="success">Open</Badge>;
}

export default async function InternshipsPage() {
  const internships = await getInternships();

  const open = internships.filter((item) => !item.deadline || new Date(item.deadline).getTime() >= Date.now());
  const closed = internships.filter((item) => item.deadline && new Date(item.deadline).getTime() < Date.now());

  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">Student hub</p>
        <h1 className="text-4xl">Internship &amp; Pupillage Board</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Openings shared with Sheria Docket by Kenyan firms, county governments and legal aid providers. Always confirm
          the details with the organisation before applying.
        </p>
      </header>

      {open.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No open positions listed right now. Send leads to docket@sheriadocket.co.ke and we will publish them.
        </p>
      ) : (
        <div className="mt-10 space-y-4">
          {open.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl">{item.title}</h2>
                    {deadlineBadge(item.deadline)}
                  </div>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {item.firm_name}
                    </span>
                    {item.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </span>
                    ) : null}
                    {item.deadline ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Deadline {formatDate(item.deadline)}
                      </span>
                    ) : null}
                  </p>
                  {item.description ? (
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>

                {item.application_link ? (
                  <Button asChild variant="gold" className="shrink-0">
                    <a href={item.application_link} target="_blank" rel="noopener noreferrer">
                      Apply
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {closed.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl text-muted-foreground">Recently closed</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {closed.map((item) => (
              <li key={item.id}>
                {item.title} — {item.firm_name}
                {item.deadline ? ` (closed ${formatDate(item.deadline)})` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
