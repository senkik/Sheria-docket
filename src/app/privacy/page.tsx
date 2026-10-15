import type { Metadata } from 'next';
import Link from 'next/link';

import { DISCLAIMER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Sheria Docket collects, uses, stores and shares personal data under the Data Protection Act, 2019 and the Constitution of Kenya, 2010.'
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <header className="space-y-3">
        <p className="section-label">Legal</p>
        <h1 className="text-4xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: 1 October 2026</p>
      </header>

      <div className="article-body mt-8">
        <p>
          This policy explains how Sheria Docket (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal data in accordance
          with Article 31 of the Constitution of Kenya, 2010 and the Data Protection Act, 2019 (&ldquo;the Act&rdquo;), as
          regulated by the Office of the Data Protection Commissioner.
        </p>

        <h2>1. Who is the data controller</h2>
        <p>
          Sheria Docket is the data controller for personal data processed through this website. Data protection enquiries
          may be sent to <strong>docket@sheriadocket.co.ke</strong>.
        </p>

        <h2>2. What we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> your name, email address, avatar provided by your sign-in provider, and your
            role on the platform (reader, author, editor or administrator).
          </li>
          <li>
            <strong>Content you submit:</strong> comments, article drafts, article revisions and any files you link to
            those articles.
          </li>
          <li>
            <strong>Newsletter data:</strong> the email address you provide when subscribing to the weekly docket.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type and pages visited, collected through cookies and
            analytics where you have consented.
          </li>
        </ul>

        <h2>3. Why we process it</h2>
        <ul>
          <li>To create and secure your account, and to authenticate you when you sign in.</li>
          <li>To publish comments and articles you choose to submit, and to attribute authorship.</li>
          <li>To send the newsletter you have requested, which you may unsubscribe from at any time.</li>
          <li>To measure readership so we can decide which judgments and topics to cover.</li>
          <li>To comply with legal obligations, including responding to lawful requests from Kenyan authorities.</li>
        </ul>

        <h2>4. Lawful basis</h2>
        <p>
          We rely on your consent (section 30 of the Act) for analytics cookies and newsletter subscriptions, on the
          performance of our agreement with you for account administration, and on our legitimate interest in maintaining
          a secure and functioning publication.
        </p>

        <h2>5. Who we share data with</h2>
        <p>
          We do not sell personal data. Data is processed by the following service providers strictly on our instructions:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — authentication, database hosting and file storage.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting and delivery.
          </li>
          <li>
            <strong>Google</strong> — optional analytics, loaded only after you accept cookies.
          </li>
        </ul>
        <p>
          Where a provider processes data outside Kenya, we rely on appropriate safeguards, including contractual
          protections consistent with section 48 of the Act.
        </p>

        <h2>6. How long we keep it</h2>
        <p>
          Account data is retained while your account is active and for twelve months afterwards. Newsletter records are
          kept until you unsubscribe plus six months. Published comments and articles remain part of the public record of
          the site unless you ask us to remove them and we agree it is appropriate.
        </p>

        <h2>7. Your rights</h2>
        <p>Under the Act you may:</p>
        <ul>
          <li>be informed of how your data is used;</li>
          <li>access the personal data we hold about you;</li>
          <li>request correction of inaccurate data;</li>
          <li>request deletion of data we no longer need;</li>
          <li>object to or restrict certain processing, including direct marketing;</li>
          <li>request portability of data you provided to us; and</li>
          <li>lodge a complaint with the Office of the Data Protection Commissioner.</li>
        </ul>
        <p>
          Requests can be made to <strong>docket@sheriadocket.co.ke</strong>. We respond within thirty days as required by
          section 33 of the Act.
        </p>

        <h2>8. Cookies</h2>
        <p>
          Essential cookies keep you signed in and protect the site against cross-site request forgery. Analytics cookies
          are set only if you accept them in the cookie banner, and you can withdraw consent at any time by clearing site
          data in your browser.
        </p>

        <h2>9. Security</h2>
        <p>
          Access to the database is governed by row level security policies, so a signed-in reader can only write what
          relates to their own account. Credentials are held in encrypted environment configuration and are never
          committed to source control.
        </p>

        <h2>10. Children</h2>
        <p>
          This site is not directed at children under eighteen. If you believe a child has provided us with personal data,
          contact us and we will delete it.
        </p>

        <h2>11. Changes</h2>
        <p>
          Material changes to this policy will be posted on this page with a revised date. Continued use of the site after a
          change indicates acceptance of the updated policy.
        </p>
      </div>

      <p className="legal-rule mt-10">{DISCLAIMER}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        See also our <Link href="/disclaimer" className="underline underline-offset-4">legal disclaimer</Link> and{' '}
        <Link href="/copyright" className="underline underline-offset-4">takedown policy</Link>.
      </p>
    </div>
  );
}
