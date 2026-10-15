import type { Metadata } from 'next';

import { PostCard } from '@/components/PostCard';
import { getPostsByFilters, getReaderBookmarks } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Know Your Law',
  description:
    'Plain-language guides to Kenyan law: what the statute says, what the courts have held, and what you need to do next.',
  openGraph: {
    title: 'Know Your Law | Sheria Docket',
    description: 'Plain-language guides to Kenyan statutes and the rights they create.'
  }
};

const STARTER_QUESTIONS = [
  'What must the police tell you before you are arrested?',
  'How long can you be held before being taken to court?',
  'What does the landlord and tenant law actually require?',
  'How do you file a land dispute at the Environment and Land Court?'
];

export default async function KnowYourLawPage() {
  const [posts, bookmarks] = await Promise.all([
    getPostsByFilters({ category: 'know_your_law', limit: 60 }),
    getReaderBookmarks()
  ]);

  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">Know your law</p>
        <h1 className="text-4xl">Your rights, in plain language</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          These guides start from the question a client actually asks, then work backwards to the statute and the case law
          that answers it — without the Latin.
        </p>
      </header>

      <section className="mt-10 rounded-lg border bg-secondary/40 p-6">
        <h2 className="font-serif text-xl">Guides we are often asked for</h2>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {STARTER_QUESTIONS.map((question) => (
            <li key={question} className="flex gap-2">
              <span className="text-gold-dark" aria-hidden>
                &bull;
              </span>
              {question}
            </li>
          ))}
        </ul>
      </section>

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              bookmark={{ saved: bookmarks.ids.has(post.id), signedIn: bookmarks.signedIn, nextPath: '/know-your-law' }}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          Guides are being drafted. Check back shortly.
        </p>
      )}
    </div>
  );
}
