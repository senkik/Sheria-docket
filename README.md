# Sheria Docket

**Law. Simplified. Localized.**

A Kenyan legal publication that bridges academic law and practice: structured case briefs of Kenyan
judgments, plain-language guides to statutes, county-level legal updates, and a Student Hub for past
papers, moot court preparation and pupillage leads.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components) with TypeScript |
| Styling | Tailwind CSS, shadcn/ui components built on Radix primitives |
| Data | Supabase (PostgreSQL, Auth, Row Level Security) |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The app runs on http://localhost:3000. `npm run typecheck` runs `tsc --noEmit`.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Publishable / anon key. Safe to expose. |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Reserved for server-side jobs that must bypass RLS. Never expose it to the browser. |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Public origin, used for canonical URLs, Open Graph and the sitemap. |
| `NEXT_PUBLIC_GA_ID` | no | Google Analytics is loaded only when this is set. |
| `RESEND_API_KEY` | no | Sends the reader alert emails. Without it, alerts queue but are not delivered. |
| `NOTIFICATIONS_FROM_EMAIL` | no | Sender for alerts, e.g. `Sheria Docket <alerts@yourdomain.co.ke>`. Defaults to Resend's test sender, which only delivers to your own account address. |

`.env.local` is gitignored. Do not commit keys.

### Database

The schema lives in `supabase/migrations/` and demo content in `supabase/seed.sql`. Apply them with
either the Supabase CLI or the SQL editor in the dashboard.

```bash
supabase link --project-ref <project-ref>
supabase db push          # applies supabase/migrations
psql "$DATABASE_URL" -f supabase/seed.sql   # optional demo content
```

The four migrations are meant to be applied in order on a fresh project:

| Migration | What it adds |
| --- | --- |
| `…_init_sheria_docket.sql` | The content tables (`profiles`, `posts`, `comments`, `resources`, `subscribers`, `internships`), Row Level Security, and the `handle_new_user` trigger that creates a `profiles` row on signup |
| `…_reader_bookmarks_follows_alerts.sql` | `bookmarks`, `follows`, `notifications`, the `on_post_published` trigger that queues reader alerts, and `profiles.notify_on_publish` |
| `…_storage_buckets.sql` | The four storage buckets and their object policies |
| `…_editorial_workflow.sql` | The `changes_requested` status, `posts.assigned_editor_id`, the `post_reviews` trail, and the author review notices |

Every migration except the first is written to be re-runnable (`create table if not exists`, `drop policy if exists`), so applying it again is safe.

The seed adds realistic Kenyan sample content: briefs of reported decisions, Know Your Law guides, a
county update, a student guide, an opinion piece, internship listings and Student Hub resources. Each
seed brief is an illustrative summary — verify every summary against the judgment before publishing it.

After signing up, promote your own account and attach the sample briefs to it:

```sql
update public.profiles set role = 'admin' where email = 'you@example.co.ke';

update public.posts
   set author_id = (select id from public.profiles where role = 'admin' order by created_at limit 1)
 where author_id is null;
```

### Authentication

Enable the providers you intend to offer under **Authentication → Providers** in Supabase:

- Email/password (with or without email confirmation).
- Google OAuth. Add `http://localhost:3000/callback` and your production
  `https://<domain>/callback` to the redirect allow-list.

Supabase redirects to `/callback`, which exchanges the PKCE code for a session cookie before handing
the reader on to the page they came from.

## Roles

Roles live on `profiles.role` and are enforced in three places: Row Level Security policies in the
database, server-side guards in each route, and conditional UI.

| Role | Can do |
| --- | --- |
| `reader` | Comment on published work, save briefs to a reading list, follow topics for email alerts, upload an avatar, download resources, subscribe to the newsletter |
| `author` | Draft posts, upload covers and judgment PDFs, submit for review, revise after requested changes (cannot publish) |
| `editor` | Everything an author can do, plus the review queue: assign, request changes, publish or return any submission |
| `admin` | Everything, including user roles, resources and internship listings |

`/dashboard`, `/reading-list` and `/student-hub/resources` require a signed-in user; the middleware
refreshes the session on every request and redirects anonymous visitors to `/login?next=…`.

## Reading list, followed topics and email alerts

Any signed-in reader can save a brief and follow the topics it belongs to:

- **Bookmarks** — the save control on every brief card and article page. Saved briefs appear at
  `/reading-list`, private to the reader's account.
- **Follows** — a topic is one of `area_of_law`, `jurisdiction` (court or county), `category` or
  `case` (a citation). Readers follow topics from a brief, from the follow picker at `/reading-list`,
  or by pasting a citation.
- **Alerts** — the `on_post_published` trigger matches a newly published brief against every reader's
  followed topics and queues one row per reader in `notifications`. One alert per reader per brief, so
  republishing after a correction never emails anyone twice.

Delivery happens the moment an editor publishes through the dashboard: `/api/posts` dispatches the
queue for that brief after the write succeeds, and a mail failure never fails the publish. Publish
straight from the database and the alerts queue up instead — send them from **Dashboard → Email
Alerts**, which lists every alert with its status and retries failed deliveries.

Emails go out over the Resend REST API (`POST /emails/batch`), so there is no email dependency to
install. To turn delivery on:

1. Create an API key at https://resend.com/api-keys and verify the domain you want to send from.
2. Set `RESEND_API_KEY` and `NOTIFICATIONS_FROM_EMAIL` in `.env.local` (and in your host's
   environment).
3. Publish a brief to a topic you follow to confirm a delivery shows as **Sent** on the alerts page.

Readers control this themselves: the toggle on `/reading-list` (`profiles.notify_on_publish`) pauses
all alert email without unfollowing anything.

## Uploads and media

Four public Supabase Storage buckets back the media fields, so covers, judgment PDFs, resources and
avatars are uploaded rather than pasted in as URLs:

| Bucket | Contents | Who can write | Limit |
| --- | --- | --- | --- |
| `covers` | Brief cover images | author, editor, admin | 5 MB, images only |
| `briefs` | Judgment PDFs | author, editor, admin | 25 MB, PDF only |
| `resources` | Student Hub downloads | admin | 25 MB, PDF/Word/text/image |
| `avatars` | Reader avatars | any signed-in reader | 2 MB, images only |

The `FileUpload` control uploads straight from the browser to the bucket with the reader's own session,
then writes the resulting public URL into the form. Nothing goes through a Next.js route, so the upload
is not capped by the serverless request body limit — a 25 MB judgment would otherwise fail on Vercel.
Storage policies scope every write to `<auth.uid()>/<timestamp>-<file>`, and the bucket itself enforces
the size and MIME limits listed above. The same checks are repeated in `src/lib/storage.ts` so a
rejected file never leaves the browser.

Cover and PDF fields still accept a pasted link. `CoverImage` renders links from this project's storage
through `next/image` (which needs the host configured in `next.config.mjs`) and anything else as a plain
`<img>`, so an external link cannot break a page.

One caveat about public buckets: an upload is served with a one-year `cache-control`, so a **deleted**
object can still be served from the CDN at its old URL until that window expires. Uploads always use a
fresh key, so replacing media is unaffected.

## Editorial workflow

A submission moves through four states, and every editorial action is recorded:

```
draft ──submit──► pending_review ──┬── publish ──────────► published
                                   ├── request changes ──► changes_requested ──resubmit──► pending_review
                                   └── return to draft ──► draft
```

- **Review queue** (`/dashboard/review`) lists every `pending_review` submission, oldest first, with its
author, section, age and assigned reviewer. Editors and admins only.
- **Review screen** (`/dashboard/review/[id]`) shows the submission the way it will publish — structured
case brief sections, body, PDF link — alongside the decision panel and the full history.
- **Decisions** are made from that panel: assign the submission to yourself, publish it, request changes
with notes, or send it back to draft. Notes are required when requesting changes, kept on the `post_reviews`
trail, and emailed to the author.
- **Author view**: the post list marks submissions with requested changes and shows the editor's note; the
edit screen repeats it in full above the form. The author revises and submits again for review.
- **Emails** go out through the same queue as reader alerts: an author notice per decision (published,
changes requested, returned) and one reader alert per follower the moment a brief is published. Authors
are never emailed about their own brief.

`post_reviews` is append-only and readable by the submission's author and the editorial desk; only staff
can write to it, and staff may only act as themselves.

```
src/
├── app/
│   ├── (auth)/login, signup, callback      # authentication
│   ├── cases/                              # case briefs + detail page
│   ├── know-your-law/, county-cases/       # guides and county updates
│   ├── student-hub/                        # resources, moot court, internships
│   ├── reading-list/                       # saved briefs, followed topics, alert preference
│   ├── dashboard/                          # protected editorial tools: review queue, posts, alerts,
│   │                                       # users, resources, internships, profile
│   ├── api/                                # cases, posts, reviews, comments, newsletter, resources,
│   │                                       # internships, users, profile, bookmarks, follows,
│   │                                       # notifications
│   ├── privacy, disclaimer, copyright      # compliance pages
│   └── sitemap.ts, robots.ts
├── components/                             # shadcn/ui primitives in ui/, feature components alongside
├── hooks/use-toast.ts
├── lib/                                    # supabase clients, queries, auth helpers, constants, utils
├── middleware.ts                           # session refresh + route protection
└── types/database.ts                       # typed schema
```

## Content model

Posts carry a `category` that decides where the article lives and how it renders:

| Category | Route | Notes |
| --- | --- | --- |
| `case_brief` | `/cases/[slug]` | Renders citation, bench, facts, issues, holding and obiter as structured sections, plus an uploaded judgment PDF |
| `opinion` | `/cases/[slug]` | Long-form commentary |
| `know_your_law` | `/know-your-law/[slug]` | Plain-language guides |
| `county_update` | `/county-cases/[slug]` | County-level developments |
| `student_guide` | `/student-hub/[slug]` | Study material |

Bodies are written in Markdown, rendered with `react-markdown` and GitHub-flavoured tables.

## Compliance

The footer links to a privacy policy written against the Data Protection Act, 2019, a legal
disclaimer, and a copyright takedown policy. Every article ends with the disclaimer that the content is
educational and does not constitute legal advice. A cookie banner records consent before analytics
cookies are enabled.

## Notes on SEO

Every article and section exports `generateMetadata`, producing canonical URLs, Open Graph images from
the post cover and Twitter cards. `/sitemap.xml` is generated from the published posts and `/robots.txt`
keeps the dashboard and API out of the index.
