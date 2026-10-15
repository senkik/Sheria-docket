'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'sheria-docket.cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function record(choice: 'accepted' | 'declined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
    } catch {
      // Private browsing modes can block storage; the banner still dismisses.
    }

    setVisible(false);

    if (choice === 'accepted' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-gold/30 bg-navy/95 text-white backdrop-blur"
    >
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-white/80">
          We use cookies for site analytics and to remember your preferences. Read how we handle personal data under the
          Data Protection Act, 2019 in our{' '}
          <Link href="/privacy" className="font-medium text-gold underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => record('declined')}>
            Decline
          </Button>
          <Button variant="gold" size="sm" onClick={() => record('accepted')}>
            Accept cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
