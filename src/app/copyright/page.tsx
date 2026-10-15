import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Copyright Takedown Policy',
  description:
    'How to notify Sheria Docket of unauthorised use of copyright material, and how we respond, under the Copyright Act, 2001.'
};

export default function CopyrightPage() {
  return (
    <div className="container max-w-3xl py-12">
      <header className="space-y-3">
        <p className="section-label">Legal</p>
        <h1 className="text-4xl">Copyright Takedown Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: 1 October 2026</p>
      </header>

      <div className="article-body mt-8">
        <h2>1. Our content</h2>
        <p>
          Original articles, case briefs, guides and commentary published on Sheria Docket are protected under the
          Copyright Act, 2001 (Cap 130). You may quote from our work with attribution and a link to the original article.
          Republishing an article in full, on a website or in print, requires our written permission.
        </p>

        <h2>2. Quoting judgments and statutes</h2>
        <p>
          Judicial decisions and legislation are public documents. We publish extracts of judgments for the purpose of
          reporting and criticism, with the citation and a link to the source. We do not claim copyright over the text of any
          judgment, statute or other government publication.
        </p>

        <h2>3. Reporting infringement</h2>
        <p>
          If you believe material on this site infringes your copyright, send a notice to{' '}
          <strong>docket@sheriadocket.co.ke</strong> with the subject line &ldquo;Copyright Notice&rdquo;. Include:
        </p>
        <ul>
          <li>your full name, postal address, telephone number and email address;</li>
          <li>a description of the copyright work you say has been infringed;</li>
          <li>the exact URL of the material you want removed, sufficient for us to locate it;</li>
          <li>a statement that you have a good faith belief the use is not authorised by the owner, its agent or the law;</li>
          <li>a statement, made under penalty of perjury, that the information in your notice is accurate and that you are the owner or authorised to act for the owner; and</li>
          <li>your physical or electronic signature.</li>
        </ul>

        <h2>4. What happens next</h2>
        <p>
          We acknowledge notices within two working days. Where a notice is complete and well founded, we remove or disable
          access to the material within seven working days and notify the contributor who uploaded it. Contributors may
          submit a counter-notice explaining why the use is lawful, which we will forward to you.
        </p>

        <h2>5. Repeat infringement</h2>
        <p>
          Contributors who repeatedly upload infringing material will have their publishing rights suspended and, where
          appropriate, their account closed.
        </p>

        <h2>6. Student Hub documents</h2>
        <p>
          Past papers, statutes and revision notes in the Student Hub are shared for study. We do not knowingly host
          material in breach of copyright. If you own a document listed there and want it removed, the procedure above
          applies and we will take it down.
        </p>

        <h2>7. Reporting our material used elsewhere</h2>
        <p>
          If you find a Sheria Docket article reproduced elsewhere without attribution, tell us at the same address. We
          pursue these notices directly with the publisher before taking any further step.
        </p>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        See also our <Link href="/privacy" className="underline underline-offset-4">privacy policy</Link> and{' '}
        <Link href="/disclaimer" className="underline underline-offset-4">legal disclaimer</Link>.
      </p>
    </div>
  );
}
