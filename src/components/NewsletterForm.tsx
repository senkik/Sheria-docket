'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { isEmail } from '@/lib/utils';

export function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEmail(email)) {
      toast({ variant: 'destructive', title: 'Check your email', description: 'That address does not look right.' });
      return;
    }

    setPending(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'Subscription failed.');

      toast({
        variant: 'success',
        title: 'Karibu!',
        description: 'You are on the list. Look out for the Friday docket.'
      });
      setEmail('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not subscribe',
        description: error instanceof Error ? error.message : 'Please try again in a moment.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.co.ke"
        className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
        required
      />
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Subscribe
      </Button>
    </form>
  );
}
