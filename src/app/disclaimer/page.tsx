import type { Metadata } from 'next';
import Link from 'next/link';

import { DISCLAIMER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Legal Disclaimer',
  description:
    'Sheria Docket publishes legal information for education. Nothing on this site is legal advice, and no advocate-client relationship is created by reading it.'
};

export default function DisclaimerPage() {
  return (
    <div className="container max-w-3xl py-12">
      <header className="space-y-3">
        <p className="section-label">Legal</p>
        <h1 className="text-4xl">Legal Disclaimer</h1>
        <p className="text-sm text-muted-foreground">Last updated: 1 October 2026</p>
      </header>

      <div className="article-body mt-8">
        <h2>1. No legal advice</h2>
        <p>{DISCLAIMER} Reading this site does not create an advocate-client relationship with Sheria Docket, its editors or its contributors. Do not act, or refrain from acting, on the basis of anything published here without seeking advice from an advocate of the High Court of Kenya who has considered your particular facts.</p>

        <h2>2. Reporting and summaries</h2>
        <p>
          Case briefs are summaries prepared for study and commentary. A summary is not a substitute for the judgment
          itself, and any brief should be read alongside the primary document, which we link wherever it is publicly
          available. Where we quote a judgment, the quotation is taken from the copy published on Kenya Law or the
          Judiciary&apos;s own portal.
        </p>

        <h2>3. Currency of the law</h2>
        <p>
          Kenyan law changes. Statutes are amended, decisions are overturned on appeal and subordinate legislation is
          replaced. Articles carry the date they were published, and an article that was accurate on that date may no
          longer reflect the law today.
        </p>

        <h2>4. Jurisdiction</h2>
        <p>
          Content on this site discusses the law of the Republic of Kenya. It is not intended for use in any other
          jurisdiction, and nothing here should be taken as advice on the law of another country.
        </p>

        <h2>5. No professional relationship</h2>
        <p>
          Sending us an email, submitting a comment or filling in the contact form does not create an advocate-client
          relationship and does not oblige us to act for you. Do not send confidential information about a live matter
          through this site.
        </p>

        <h2>6. Student material</h2>
        <p>
          Guides, past papers and moot court material in the Student Hub are provided to support study. They are not
          model answers, they do not represent the views of any university or the Kenya School of Law, and they should not
          be relied on as a statement of the law in an examination or in practice.
        </p>

        <h2>7. Third-party links</h2>
        <p>
          We link to judgments, statutes and external resources for convenience. We do not control those sites and are not
          responsible for their content, availability or privacy practices.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Sheria Docket, its editors and its contributors accept no liability for
          any loss or damage arising from reliance on the content of this site.
        </p>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        See also our <Link href="/privacy" className="underline underline-offset-4">privacy policy</Link> and{' '}
        <Link href="/copyright" className="underline underline-offset-4">copyright takedown policy</Link>.
      </p>
    </div>
  );
}
