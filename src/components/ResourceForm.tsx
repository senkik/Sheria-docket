'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RESOURCE_CATEGORIES } from '@/lib/constants';

export function ResourceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = React.useState('');
  const [fileUrl, setFileUrl] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState(RESOURCE_CATEGORIES[0]);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fileUrl.trim()) {
      toast({
        variant: 'destructive',
        title: 'A file is required',
        description: 'Upload the resource file, or paste a link to one hosted elsewhere.'
      });
      return;
    }

    setPending(true);

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, file_url: fileUrl, description, category })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'The resource could not be saved.');

      toast({ variant: 'success', title: 'Resource added', description: 'It is now listed in the Student Hub.' });
      setTitle('');
      setFileUrl('');
      setDescription('');
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
      <h2 className="font-serif text-xl">Add a resource</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="resource-title">Title</Label>
          <Input
            id="resource-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Criminal Procedure Code and Sheria Docket revision notes"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resource-category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="resource-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FileUpload
        bucket="resources"
        id="resource-url"
        label="Resource file"
        value={fileUrl}
        onChange={setFileUrl}
        hint="Students download this from the Resource Centre."
      />

      <div className="space-y-2">
        <Label htmlFor="resource-description">Description</Label>
        <Textarea
          id="resource-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add resource
      </Button>
    </form>
  );
}
