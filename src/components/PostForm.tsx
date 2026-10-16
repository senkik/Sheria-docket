'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Save } from 'lucide-react';

import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AREAS_OF_LAW, CATEGORIES, COUNTIES, COURTS, DECISION_LABELS } from '@/lib/constants';
import { formatDate, slugify } from '@/lib/utils';
import type { PostReviewWithEditor, PostWithAuthor, ReviewDecision, UserRole } from '@/types/database';

interface PostFormProps {
  role: UserRole;
  post?: PostWithAuthor;
  /** The desk's most recent decision, shown to the author when revising. */
  feedback?: PostReviewWithEditor | null;
}

type FormState = {
  title: string;
  slug: string;
  category: string;
  jurisdiction: string;
  area_of_law: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  pdf_url: string;
  citation: string;
  bench: string;
  facts: string;
  issues: string;
  holding: string;
  obiter: string;
  status: string;
};

function initialState(post?: PostWithAuthor): FormState {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    category: post?.category ?? 'case_brief',
    jurisdiction: post?.jurisdiction ?? '',
    area_of_law: post?.area_of_law ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    cover_image_url: post?.cover_image_url ?? '',
    pdf_url: post?.pdf_url ?? '',
    citation: post?.citation ?? '',
    bench: post?.bench ?? '',
    facts: post?.facts ?? '',
    issues: post?.issues ?? '',
    holding: post?.holding ?? '',
    obiter: post?.obiter ?? '',
    status: post?.status ?? 'draft'
  };
}

export function PostForm({ role, post, feedback }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState<FormState>(() => initialState(post));
  const [slugTouched, setSlugTouched] = React.useState(Boolean(post));
  const [pending, setPending] = React.useState(false);

  const canPublish = role === 'admin' || role === 'editor';
  const isCaseBrief = form.category === 'case_brief';
  const isCountyUpdate = form.category === 'county_update';
  const jurisdictions = isCountyUpdate ? COUNTIES.map((county) => `${county} County`) : COURTS;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value)
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast({ variant: 'destructive', title: 'Title required', description: 'Give the post a headline first.' });
      return;
    }

    setPending(true);

    try {
      const response = await fetch('/api/posts', {
        method: post ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: post?.id })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'The post could not be saved.');

      toast({
        variant: 'success',
        title: post ? 'Post updated' : 'Post saved',
        description:
          form.status === 'published'
            ? 'It is live on the site.'
            : form.status === 'pending_review'
              ? 'It is with the editorial desk for review.'
              : 'Saved as a draft.'
      });

      router.push('/dashboard/posts');
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

  const needsRevision = feedback?.decision === 'changes_requested';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {needsRevision ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            {DECISION_LABELS[feedback.decision as ReviewDecision] ?? 'Changes requested'} by{' '}
            {feedback.profiles?.full_name ?? 'the editorial desk'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(feedback.created_at, true)}</p>
          {feedback.notes ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{feedback.notes}</p>
          ) : null}
          <p className="mt-3 text-xs text-muted-foreground">
            Revise the brief, then set the status to “Submit for review”. Your editor is told the moment it goes back in
            the queue.
          </p>
        </div>
      ) : null}

      <Card>
        <CardContent className="grid gap-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Republic v Independent Electoral and Boundaries Commission"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  update('slug', event.target.value);
                }}
                placeholder="republic-v-iebc"
              />
              <p className="text-xs text-muted-foreground">Used in the article URL.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => update('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">{isCountyUpdate ? 'County' : 'Court'}</Label>
              <Select value={form.jurisdiction || 'none'} onValueChange={(value) => update('jurisdiction', value === 'none' ? '' : value)}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {jurisdictions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area of law</Label>
              <Select value={form.area_of_law || 'none'} onValueChange={(value) => update('area_of_law', value === 'none' ? '' : value)}>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {AREAS_OF_LAW.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(event) => update('excerpt', event.target.value)}
              placeholder="One paragraph a reader can act on."
            />
          </div>
        </CardContent>
      </Card>

      {isCaseBrief ? (
        <Card>
          <CardContent className="grid gap-5 p-6">
            <div>
              <h2 className="font-serif text-xl">Case brief fields</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These appear as structured sections on the published brief.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="citation">Citation</Label>
                <Input
                  id="citation"
                  value={form.citation}
                  onChange={(event) => update('citation', event.target.value)}
                  placeholder="[2023] eKLR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bench">Bench</Label>
                <Input
                  id="bench"
                  value={form.bench}
                  onChange={(event) => update('bench', event.target.value)}
                  placeholder="Koome CJ, Mwilu DCJ, Wanjala, Njoki Ndungu & Ouko SCJJ"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facts">Facts</Label>
              <Textarea id="facts" rows={5} value={form.facts} onChange={(event) => update('facts', event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues">Issues</Label>
              <Textarea id="issues" rows={4} value={form.issues} onChange={(event) => update('issues', event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holding">Holding (ratio decidendi)</Label>
              <Textarea id="holding" rows={4} value={form.holding} onChange={(event) => update('holding', event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obiter">Obiter dicta</Label>
              <Textarea id="obiter" rows={3} value={form.obiter} onChange={(event) => update('obiter', event.target.value)} />
            </div>

            <FileUpload
              bucket="briefs"
              id="pdf_url"
              value={form.pdf_url}
              onChange={(url) => update('pdf_url', url)}
              allowUrl={false}
              hint="Readers download this from the published brief."
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="grid gap-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="content">Body</Label>
            <Textarea
              id="content"
              rows={18}
              value={form.content}
              onChange={(event) => update('content', event.target.value)}
              placeholder={'## Background\n\nMarkdown is supported: headings, lists, bold and links to eKLR sources.'}
              className="font-mono text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Markdown is supported. Headings start with ##, lists with -, and citations can be linked to Kenya Law.
            </p>
          </div>

          <FileUpload
            bucket="covers"
            id="cover_image_url"
            value={form.cover_image_url}
            onChange={(url) => update('cover_image_url', url)}
            allowUrl={false}
            hint="Shown on cards and at the top of the brief. Images stored here are optimised automatically."
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full space-y-2 sm:max-w-xs">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => update('status', value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Submit for review</SelectItem>
                {form.status === 'changes_requested' ? (
                  <SelectItem value="changes_requested" disabled>
                    Changes requested
                  </SelectItem>
                ) : null}
                {canPublish ? <SelectItem value="published">Publish</SelectItem> : null}
              </SelectContent>
            </Select>
            {!canPublish ? (
              <p className="text-xs text-muted-foreground">
                Authors submit for review. An editor publishes once the brief has been checked.
              </p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/posts">Cancel</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {post ? 'Save changes' : 'Save post'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
