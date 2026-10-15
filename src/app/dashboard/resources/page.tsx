import { redirect } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import { DeleteButton } from '@/components/DeleteButton';
import { ResourceForm } from '@/components/ResourceForm';
import { Card, CardContent } from '@/components/ui/card';
import { canManageTaxonomy, requireProfile } from '@/lib/auth';
import { getResources } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

export default async function DashboardResourcesPage() {
  const profile = await requireProfile('/dashboard/resources');

  if (!canManageTaxonomy(profile.role)) redirect('/dashboard');

  const resources = await getResources();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl">Resources</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Documents in the Student Hub resource centre. Links must point to a publicly reachable file, ideally in the
          project&apos;s Supabase storage bucket.
        </p>
      </header>

      <ResourceForm />

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Library ({resources.length})</h2>

        {resources.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            The library is empty.
          </p>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-xs uppercase tracking-wide text-gold-dark">{resource.category ?? 'Other'}</p>
                    {resource.description ? (
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">Added {formatDate(resource.created_at)}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open file
                    </a>
                    <DeleteButton
                      endpoint="/api/resources"
                      id={resource.id}
                      confirmMessage={`Remove “${resource.title}” from the resource centre?`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
