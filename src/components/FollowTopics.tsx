import { BellRing } from 'lucide-react';

import { FollowButton } from '@/components/FollowButton';
import { followLabel } from '@/lib/constants';
import { followKey } from '@/lib/utils';
import type { PostWithAuthor } from '@/types/database';

interface FollowTopicsProps {
  post: PostWithAuthor;
  followKeys: Set<string>;
  signedIn: boolean;
  nextPath: string;
}

/** Every topic a brief can be followed under, drawn from its own metadata. */
export function briefTopics(post: Pick<PostWithAuthor, 'area_of_law' | 'jurisdiction' | 'citation' | 'category'>) {
  const candidates = [
    post.area_of_law ? { kind: 'area_of_law', value: post.area_of_law } : null,
    post.jurisdiction ? { kind: 'jurisdiction', value: post.jurisdiction } : null,
    post.citation ? { kind: 'case', value: post.citation } : null,
    post.category ? { kind: 'category', value: post.category } : null
  ].filter((topic): topic is { kind: string; value: string } => Boolean(topic));

  const seen = new Set<string>();

  return candidates.filter((topic) => {
    const key = followKey(topic.kind, topic.value);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function FollowTopics({ post, followKeys, signedIn, nextPath }: FollowTopicsProps) {
  const topics = briefTopics(post);

  if (topics.length === 0) return null;

  return (
    <section className="mt-8 rounded-lg border bg-secondary/30 p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <BellRing className="h-3.5 w-3.5 text-gold-dark" />
        Follow this brief&apos;s topics
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <FollowButton
            key={`${topic.kind}:${topic.value}`}
            kind={topic.kind}
            value={topic.value}
            label={followLabel(topic.kind, topic.value)}
            following={followKeys.has(followKey(topic.kind, topic.value))}
            signedIn={signedIn}
            nextPath={nextPath}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        We email you the next time a brief on a followed topic is published. Change that any time on your reading list.
      </p>
    </section>
  );
}
