'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/types/database';

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    full_name: profile.full_name ?? '',
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url ?? ''
  });
  const [pending, setPending] = React.useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.full_name.trim()) {
      toast({ variant: 'destructive', title: 'Name required', description: 'Readers see this name on your comments.' });
      return;
    }

    setPending(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'Your profile could not be updated.');

      toast({ variant: 'success', title: 'Profile updated' });
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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          value={form.full_name}
          onChange={(event) => update('full_name', event.target.value)}
          placeholder="Wanjiku Kamau"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Short biography</Label>
        <Textarea
          id="bio"
          rows={4}
          value={form.bio}
          onChange={(event) => update('bio', event.target.value)}
          placeholder="Advocate of the High Court of Kenya, Nairobi. Writes on land and constitutional law."
        />
        <p className="text-xs text-muted-foreground">Shown next to your byline and on your comments.</p>
      </div>

      <FileUpload
        bucket="avatars"
        id="avatar_url"
        label="Avatar"
        value={form.avatar_url}
        onChange={(url) => update('avatar_url', url)}
        hint="Shown beside your byline and comments. Square images work best."
      />

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </Button>
    </form>
  );
}
