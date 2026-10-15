'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function InternshipForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    title: '',
    firm_name: '',
    location: '',
    description: '',
    application_link: '',
    deadline: ''
  });
  const [pending, setPending] = React.useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);

    try {
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'The listing could not be saved.');

      toast({ variant: 'success', title: 'Listing published', description: 'It now appears on the internship board.' });
      setForm({ title: '', firm_name: '', location: '', description: '', application_link: '', deadline: '' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Not saved',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
      <h2 className="font-serif text-xl">Post an opening</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="internship-title">Position</Label>
          <Input
            id="internship-title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="Pupillage 2027"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="internship-firm">Firm or organisation</Label>
          <Input
            id="internship-firm"
            value={form.firm_name}
            onChange={(event) => update('firm_name', event.target.value)}
            placeholder="Kaplan & Stratton Advocates"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="internship-location">Location</Label>
          <Input
            id="internship-location"
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="Nairobi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="internship-deadline">Application deadline</Label>
          <Input
            id="internship-deadline"
            type="date"
            value={form.deadline}
            onChange={(event) => update('deadline', event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="internship-link">Application link</Label>
        <Input
          id="internship-link"
          value={form.application_link}
          onChange={(event) => update('application_link', event.target.value)}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internship-description">Description</Label>
        <Textarea
          id="internship-description"
          rows={3}
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Eligibility, duration and what to attach with the application."
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Publish listing
      </Button>
    </form>
  );
}
