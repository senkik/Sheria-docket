import Link from 'next/link';
import { Scale } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-gold-dark">
        <Scale className="h-6 w-6" />
      </span>
      <div className="space-y-3">
        <h1 className="text-3xl">This page is not on the docket</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          The brief or page you are looking for has moved or was never published. Try the case briefs index, or search by
          citation.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/cases">Browse case briefs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
