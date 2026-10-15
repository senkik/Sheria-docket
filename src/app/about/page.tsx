import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Scale, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DISCLAIMER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Sheria Docket',
  description:
    'Sheria Docket is a Kenyan legal publication that turns judgments, statutes and county notices into briefs that students, practitioners and the public can use.',
  openGraph: {
    title: 'About Sheria Docket',
    description: 'Our mission, our editorial standards and how to reach the team.'
  }
};

const PRINCIPLES = [
  {
    title: 'Accuracy over speed',
    body: 'Every brief is checked against the judgment as delivered. Where a matter is on appeal, we say so, and we link the primary document.'
  },
  {
    title: 'Plain language, precise law',
    body: 'We write in English a client can follow without losing the legal precision that makes the analysis useful in practice.'
  },
  {
    title: 'Kenyan first',
    body: 'Authorities are Kenyan unless there is a reason otherwise. Citations follow the eKLR format used by the Judiciary.'
  }
];

const TEAM = [
  {
    name: 'Editorial Desk',
    role: 'Commissioning and review',
    note: 'Handles case brief commissions, the review queue and corrections.'
  },
  {
    name: 'Student Contributors',
    role: 'Student Hub and moot court',
    note: 'Law students across Kenyan universities writing guides, digests and competition reports.'
  },
  {
    name: 'Practitioner Panel',
    role: 'Peer review',
    note: 'Advocates and magistrates who read briefs before publication.'
  }
];

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12">
      <header className="space-y-3">
        <p className="section-label">About us</p>
        <h1 className="text-4xl">Bridging the lecture hall and the courtroom</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Sheria Docket is a Kenyan legal blog built on a simple observation: the law that affects Kenyans most is decided
          every week, but the reasoning is buried in judgments that few people outside the profession ever read.
        </p>
      </header>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-gold-dark">
              <Target className="h-5 w-5" />
            </span>
            <h2 className="font-serif text-xl">Our mission</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Make Kenyan law legible to the people it governs — students who need to understand it, advocates who need to
              argue it, and citizens who need to live under it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-gold-dark">
              <Scale className="h-5 w-5" />
            </span>
            <h2 className="font-serif text-xl">What we publish</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Case briefs with citation, bench, facts, issues, holding and obiter dicta; Know Your Law guides; county
              updates; and the Student Hub for study material and opportunities.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl">How we work</h2>
        <div className="mt-6 space-y-5">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="border-l-2 border-gold pl-5">
              <h3 className="font-serif text-lg">{principle.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl">Who writes here</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TEAM.map((member) => (
            <Card key={member.name}>
              <CardContent className="space-y-2 p-5">
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-xs uppercase tracking-wide text-gold-dark">{member.role}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{member.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-lg border bg-secondary/40 p-8">
        <h2 className="text-2xl">Contribute or get in touch</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          We accept submissions from students, advocates and academics. Send a pitch, a judgment worth briefing, or a
          correction. Internship and pupillage openings can be sent to the same address for listing on the Student Hub.
        </p>
        <div className="mt-5 flex flex-col gap-4 text-sm sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-gold-dark" />
            docket@sheriadocket.co.ke
          </span>
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Nairobi, Kenya
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup">Create a contributor account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/posts/new">Pitch a brief</Link>
          </Button>
        </div>
      </section>

      <p className="legal-rule mt-10">{DISCLAIMER}</p>
    </div>
  );
}
