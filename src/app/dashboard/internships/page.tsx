import { redirect } from 'next/navigation';

import { DeleteButton } from '@/components/DeleteButton';
import { InternshipForm } from '@/components/InternshipForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { canManageTaxonomy, requireProfile } from '@/lib/auth';
import { getInternships } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

export default async function DashboardInternshipsPage() {
  const profile = await requireProfile('/dashboard/internships');

  if (!canManageTaxonomy(profile.role)) redirect('/dashboard');

  const internships = await getInternships();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl">Internships</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Openings published to the Student Hub board. Listings past their deadline drop into a closed section
          automatically.
        </p>
      </header>

      <InternshipForm />

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Published listings ({internships.length})</h2>

        {internships.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No openings listed yet.
          </p>
        ) : (
          <div className="space-y-3">
            {internships.map((internship) => {
              const closed = internship.deadline ? new Date(internship.deadline).getTime() < Date.now() : false;

              return (
                <Card key={internship.id}>
                  <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{internship.title}</p>
                        <Badge variant={closed ? 'muted' : 'success'}>{closed ? 'Closed' : 'Open'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {internship.firm_name}
                        {internship.location ? ` · ${internship.location}` : ''}
                        {internship.deadline ? ` · deadline ${formatDate(internship.deadline)}` : ''}
                      </p>
                    </div>

                    <DeleteButton
                      endpoint="/api/internships"
                      id={internship.id}
                      confirmMessage={`Remove the “${internship.title}” listing?`}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
