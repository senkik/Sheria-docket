import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Briefcase, FileDown, Trophy } from 'lucide-react';

import { PostCard } from '@/components/PostCard';
import { Card, CardContent } from '@/components/ui/card';
import { getPostsByFilters, getReaderBookmarks } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Student Hub',
  description:
    'Study guides, downloadable past papers, moot court preparation and pupillage opportunities for Kenyan law students.',
  openGraph: {
    title: 'Student Hub | Sheria Docket',
    description: 'Study guides, past papers, moot court and pupillage leads for Kenyan law students.'
  }
};

const HUBS = [
  {
    href: '/student-hub/resources',
    title: 'Resource Centre',
    description: 'Past papers, statutes, case digests and revision notes, ready to download.',
    icon: FileDown
  },
  {
    href: '/student-hub/moot-court',
    title: 'Moot Court Corner',
    description: 'Competition calendars, memorial drafting guidance and oral advocacy drills.',
    icon: Trophy
  },
  {
    href: '/student-hub/internships',
    title: 'Internship & Pupillage Board',
    description: 'Current openings at Kenyan firms, county offices and legal aid organisations.',
    icon: Briefcase
  }
];

const STUDY_TIPS = [
  {
    title: 'Read the judgment, not the summary',
    body: 'Marks in Kenyan law exams come from the reasoning. Pull out the bench, the pleadings, the issues framed and the orders, then attempt the ratio in your own words.'
  },
  {
    title: 'Anchor every topic to a Kenyan citation',
    body: 'A Civil Procedure answer without a citation such as Mbogo & Another v Shah is a guess. Keep a running list of two authorities per topic across the syllabus.'
  },
  {
    title: 'Build your statute book early',
    body: 'Tab the Constitution 2010, the Civil Procedure Act, the Penal Code, the Land Registration Act and the Employment Act. Examination halls reward familiarity with section numbers.'
  },
  {
    title: 'Practise issue spotting under time',
    body: 'Take an hour, take a past paper and write only the issue statements and the authorities you would cite. Speed in framing issues is what separates a first from a pass.'
  }
];

export default async function StudentHubPage() {
  const [guides, bookmarks] = await Promise.all([
    getPostsByFilters({ category: 'student_guide', limit: 6 }),
    getReaderBookmarks()
  ]);

  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">Student hub</p>
        <h1 className="text-4xl">From lecture hall to courtroom</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Everything a Kenyan law student needs in one place: how to read a judgment properly, where to find past papers,
          and how to argue your first moot problem.
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {HUBS.map((hub) => (
          <Card key={hub.href} className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-3 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-gold-dark">
                <hub.icon className="h-5 w-5" />
              </span>
              <h2 className="font-serif text-xl">{hub.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{hub.description}</p>
              <Link
                href={hub.href}
                className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-gold-dark hover:underline"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-3xl">
          <BookOpen className="h-5 w-5 text-gold" />
          Study notes
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {STUDY_TIPS.map((tip) => (
            <Card key={tip.title}>
              <CardContent className="space-y-2 p-6">
                <h3 className="font-serif text-lg">{tip.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {guides.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-3xl">Latest student guides</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <PostCard
                key={guide.id}
                post={guide}
                bookmark={{ saved: bookmarks.ids.has(guide.id), signedIn: bookmarks.signedIn, nextPath: '/student-hub' }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
