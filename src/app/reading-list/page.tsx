import type { Metadata } from 'next';
import Link from 'next/link';
import { BellRing, BookmarkCheck } from 'lucide-react';

import { AlertsPreference } from '@/components/AlertsPreference';
import { CaseBriefCard } from '@/components/CaseBriefCard';
import { FollowButton } from '@/components/FollowButton';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { requireProfile } from '@/lib/auth';
import { AREAS_OF_LAW, CATEGORIES, COURTS, FOLLOW_KIND_LABELS, followHref, followLabel } from '@/lib/constants';
import { getBookmarkedPosts, getFollows, getJurisdictions } from '@/lib/queries';
import { followKey } from '@/lib/utils';
import type { FollowKind } from '@/types/database';

export const metadata: Metadata = {
  title: 'Reading list',
  robots: { index: false, follow: false }
};

interface Topic {
  kind: FollowKind;
  value: string;
}

export default async function ReadingListPage() {
  const profile = await requireProfile('/reading-list');
  const [saved, follows, jurisdictions] = await Promise.all([
    getBookmarkedPosts(),
    getFollows(),
    getJurisdictions()
  ]);

  const followedKeys = new Set(follows.map((follow) => followKey(follow.kind, follow.value)));

  const groups: { label: string; topics: Topic[]; hint: string }[] = [
    {
      label: 'Areas of law',
      hint: 'Follow an area of law to hear about every brief filed under it.',
      topics: AREAS_OF_LAW.map((value) => ({ kind: 'area_of_law' as FollowKind, value }))
    },
    {
      label: 'Courts and counties',
      hint: 'Courts where judgments come from, and the counties covered by county updates.',
      topics: Array.from(new Set([...COURTS, ...jurisdictions])).map((value) => ({
        kind: 'jurisdiction' as FollowKind,
        value
      }))
    },
    {
      label: 'Sections of the docket',
      hint: 'Case briefs, student guides, county updates and plain-language explainers.',
      topics: CATEGORIES.map((category) => ({ kind: 'category' as FollowKind, value: category.value }))
    }
  ].map((group) => ({
    ...group,
    topics: group.topics.filter((topic) => !followedKeys.has(followKey(topic.kind, topic.value)))
  }));

  const hasSuggestions = groups.some((group) => group.topics.length > 0);

  return (
    <div className="container max-w-5xl py-12">
      <header className="space-y-3">
        <p className="section-label">Your account</p>
        <h1 className="text-4xl">Reading list</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Briefs you have saved, the topics you follow, and the email alerts that bring new briefs to your inbox.
        </p>
      </header>

      <div className="mt-8">
        <AlertsPreference enabled={profile.notify_on_publish} />
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <BookmarkCheck className="h-5 w-5 text-gold-dark" />
            Saved briefs
          </h2>
          <span className="text-sm text-muted-foreground">
            {saved.length} {saved.length === 1 ? 'brief' : 'briefs'}
          </span>
        </div>

        {saved.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {saved.map((post) =>
              post.category === 'case_brief' ? (
                <CaseBriefCard
                  key={post.id}
                  post={post}
                  bookmark={{ saved: true, signedIn: true, nextPath: '/reading-list' }}
                />
              ) : (
                <PostCard
                  key={post.id}
                  post={post}
                  bookmark={{ saved: true, signedIn: true, nextPath: '/reading-list' }}
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed p-10 text-center">
            <p className="font-serif text-xl">Nothing saved yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the bookmark on any brief to keep it here. Your reading list is private to your account.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/cases">Browse case briefs</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="mt-14 border-t pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <BellRing className="h-5 w-5 text-gold-dark" />
            Topics you follow
          </h2>
          <span className="text-sm text-muted-foreground">
            {follows.length} {follows.length === 1 ? 'topic' : 'topics'}
          </span>
        </div>

        {follows.length > 0 ? (
          <div className="mt-6 space-y-5">
            {(['area_of_law', 'jurisdiction', 'case', 'category'] as FollowKind[]).map((kind) => {
              const group = follows.filter((follow) => follow.kind === kind);

              if (group.length === 0) return null;

              return (
                <div key={kind}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{FOLLOW_KIND_LABELS[kind]}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.map((follow) => (
                      <div key={follow.id} className="flex items-center gap-2">
                        <FollowButton
                          kind={follow.kind}
                          value={follow.value}
                          label={followLabel(follow.kind, follow.value)}
                          following
                          signedIn
                          nextPath="/reading-list"
                        />
                        <Link
                          href={followHref(follow.kind, follow.value)}
                          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-gold-dark"
                        >
                          Browse
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            You are not following anything yet. Pick a topic below and we will email you the next time a brief on it is
            published.
          </p>
        )}
      </section>

      {hasSuggestions ? (
        <section className="mt-14 border-t pt-10">
          <h2 className="font-serif text-2xl">Follow more topics</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Alerts go out the moment a brief is published, matched on the area of law, the court or county, the section,
            or the case citation you follow.
          </p>

          <div className="mt-6 space-y-6">
            {groups.map((group) =>
              group.topics.length === 0 ? null : (
                <div key={group.label}>
                  <h3 className="text-sm font-medium">{group.label}</h3>
                  <p className="text-xs text-muted-foreground">{group.hint}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.topics.map((topic) => (
                      <FollowButton
                        key={`${topic.kind}:${topic.value}`}
                        kind={topic.kind}
                        value={topic.value}
                        label={followLabel(topic.kind, topic.value)}
                        following={false}
                        signedIn
                        nextPath="/reading-list"
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
