import type { Metadata } from 'next';
import { Download, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentProfile } from '@/lib/auth';
import { getResources } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { Resource } from '@/types/database';

export const metadata: Metadata = {
  title: 'Resource Centre',
  description: 'Downloadable past papers, statutes, case digests and revision notes for Kenyan law students.'
};

function groupByCategory(resources: Resource[]) {
  return resources.reduce<Record<string, Resource[]>>((groups, resource) => {
    const key = resource.category ?? 'Other';
    groups[key] = groups[key] ? [...groups[key], resource] : [resource];
    return groups;
  }, {});
}

export default async function ResourcesPage() {
  const [resources, profile] = await Promise.all([getResources(), getCurrentProfile()]);
  const grouped = groupByCategory(resources);
  const categories = Object.keys(grouped).sort();

  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">Student hub</p>
        <h1 className="text-4xl">Resource Centre</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Signed in as {profile?.full_name ?? 'a member'}. Everything here is free to download and share for study
          purposes. If you hold the copyright to a document and want it removed, use our takedown policy.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No resources have been uploaded yet.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="font-serif text-2xl">{category}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {grouped[category].map((resource) => (
                  <Card key={resource.id}>
                    <CardContent className="flex gap-4 p-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy/5 text-navy dark:bg-white/10 dark:text-foreground">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="flex flex-1 flex-col gap-2">
                        <h3 className="font-medium leading-snug">{resource.title}</h3>
                        {resource.description ? (
                          <p className="text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
                        ) : null}
                        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                          <span className="text-xs text-muted-foreground">{formatDate(resource.created_at)}</span>
                          <Button asChild size="sm" variant="outline">
                            <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
