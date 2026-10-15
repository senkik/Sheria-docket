import type { Metadata } from 'next';
import { CalendarDays, Mic, ScrollText, Trophy } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Moot Court Corner',
  description:
    'Moot court preparation for Kenyan law students: memorial drafting, oral advocacy, and the competitions on the calendar.',
  openGraph: {
    title: 'Moot Court Corner | Sheria Docket',
    description: 'Memorial drafting, oral advocacy and competition calendars for Kenyan law students.'
  }
};

const COMPETITIONS = [
  {
    name: 'Kenya National Moot Court Competition',
    host: 'Kenya School of Law, Parklands',
    note: 'The national qualifier for the Christof Heyns African Human Rights Moot Court Competition.'
  },
  {
    name: 'Christof Heyns African Human Rights Moot Court Competition',
    host: 'Centre for Human Rights, University of Pretoria',
    note: 'Pan-African rounds argued on the African Charter on Human and Peoples’ Rights.'
  },
  {
    name: 'Philip C. Jessup International Law Moot Court Competition',
    host: 'International Law Students Association',
    note: 'Kenyan teams enter through the national qualifying rounds before the Washington finals.'
  },
  {
    name: 'East African Inter-University Moot Court Competition',
    host: 'Inter-University Council for East Africa',
    note: 'Arguing points of East African Community law against universities across the region.'
  },
  {
    name: 'Kenya Human Rights Commission Moot',
    host: 'Kenya Human Rights Commission',
    note: 'Focused on Bill of Rights litigation and public interest advocacy.'
  },
  {
    name: 'Chief Justice’s Annual Moot Court Competition',
    host: 'Judiciary of Kenya',
    note: 'Older students argue constitutional petitions before sitting judges of the superior courts.'
  }
];

const PREPARATION = [
  {
    title: 'Read the problem twice, then read the law',
    body: 'Most losing teams answer the problem they expected. Extract the parties, the procedural posture and the relief sought before opening a single statute.'
  },
  {
    title: 'Write the memorial from both sides',
    body: 'Draft the opposing argument first. If you cannot state your opponent’s best case, you cannot answer it confidently in the oral round.'
  },
  {
    title: 'Cite Kenyan authorities where they exist',
    body: 'A constitutional moot is stronger when grounded in decisions such as the Court of Appeal’s reasoning in the Building Bridges case or the Supreme Court’s advisory opinions.'
  },
  {
    title: 'Rehearse the answer to the hardest question',
    body: 'Judges interrupt. Practise responding in two sentences, then hand the point back to the bench before moving on.'
  }
];

export default function MootCourtPage() {
  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">Student hub</p>
        <h1 className="text-4xl">Moot Court Corner</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Mooting is where law school stops being theory. These are the competitions Kenyan teams enter, and the habits
          that separate a finalist memorial from an also-ran.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-3xl">
          <Trophy className="h-5 w-5 text-gold" />
          Competitions to watch
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {COMPETITIONS.map((competition) => (
            <Card key={competition.name} className="h-full">
              <CardContent className="space-y-2 p-6">
                <h3 className="font-serif text-lg leading-snug">{competition.name}</h3>
                <p className="text-xs uppercase tracking-wide text-gold-dark">{competition.host}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{competition.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="flex items-center gap-2 text-3xl">
            <ScrollText className="h-5 w-5 text-gold" />
            Preparing your case
          </h2>
          <ol className="mt-6 space-y-5">
            {PREPARATION.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-sm text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h3 className="flex items-center gap-2 font-serif text-lg">
                <CalendarDays className="h-4 w-4 text-gold-dark" />
                Season at a glance
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>January – February: problem release and team selection</li>
                <li>March – April: memorial drafting and citation checks</li>
                <li>May – June: internal practice rounds before a moot bench</li>
                <li>July onwards: national qualifiers and international rounds</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h3 className="flex items-center gap-2 font-serif text-lg">
                <Mic className="h-4 w-4 text-gold-dark" />
                Bench etiquette
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Stand when the bench enters. Address the court as &ldquo;My Lord&rdquo; or &ldquo;My Lady&rdquo; in Kenyan
                courts, keep your hands away from your face, and never argue with a judge — distinguish, then proceed.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
