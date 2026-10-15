import Link from 'next/link';
import { Gavel, Mail } from 'lucide-react';

import { NewsletterForm } from '@/components/NewsletterForm';
import { CATEGORIES, DISCLAIMER, SITE } from '@/lib/constants';

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Copyright Takedown Policy', href: '/copyright' },
  { label: 'About & Contact', href: '/about' }
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-navy-light/40 bg-navy text-white/80">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy">
              <Gavel className="h-5 w-5" />
            </span>
            <span className="font-serif text-lg font-semibold">Sheria Docket</span>
          </Link>
          <p className="text-sm leading-relaxed">{SITE.tagline} We translate judgments, statutes and county notices into briefs that Kenyans can act on.</p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-gold">Sections</h2>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link href={category.href} className="transition-colors hover:text-white">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-gold">Legal</h2>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-gold">Weekly Docket</h2>
          <p className="text-sm leading-relaxed">
            One email each Friday with the week&apos;s most consequential judgments and county notices.
          </p>
          <NewsletterForm />
          <p className="flex items-center gap-2 text-xs text-white/60">
            <Mail className="h-3.5 w-3.5" />
            docket@sheriadocket.co.ke
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container space-y-4 py-6 text-xs text-white/60">
          <p className="rounded-md border border-white/10 bg-white/5 p-3 leading-relaxed text-white/70">{DISCLAIMER}</p>
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved. Registered in the Republic of Kenya.
          </p>
        </div>
      </div>
    </footer>
  );
}
