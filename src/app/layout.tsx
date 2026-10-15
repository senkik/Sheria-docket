import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

import { CookieConsent } from '@/components/CookieConsent';
import { Footer } from '@/components/Footer';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { getCurrentProfile } from '@/lib/auth';
import { SITE } from '@/lib/constants';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`
  },
  description: SITE.description,
  keywords: [
    'Kenyan law',
    'case briefs Kenya',
    'eKLR',
    'Kenyan court judgments',
    'law students Kenya',
    'Sheria Docket'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.twitter,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: '#0A192F'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en-KE" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar profile={profile} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
        <Toaster />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
