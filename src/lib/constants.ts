import type { FollowKind, PostCategory, ReviewDecision, UserRole } from '@/types/database';

export const SITE = {
  name: 'Sheria Docket',
  tagline: 'Law. Simplified. Localized.',
  description:
    'Sheria Docket breaks down Kenyan case law, statutes and county-level legal developments into briefs that students, practitioners and the public can actually use.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  twitter: '@sheriadocket'
};

export const DISCLAIMER =
  'The information provided on this blog is for educational and informational purposes only and does not constitute legal advice.';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Court Cases', href: '/cases' },
  { label: 'Student Hub', href: '/student-hub' },
  { label: 'Know Your Law', href: '/know-your-law' },
  { label: 'County Cases', href: '/county-cases' },
  { label: 'About', href: '/about' }
];

export const CATEGORIES: { value: PostCategory; label: string; description: string; href: string }[] = [
  {
    value: 'case_brief',
    label: 'Case Briefs',
    description: 'Ratio decidendi, obiter dicta and the practical effect of Kenyan judgments.',
    href: '/cases'
  },
  {
    value: 'student_guide',
    label: 'Student Hub',
    description: 'Study guides, past papers and pupillage leads for law students.',
    href: '/student-hub'
  },
  {
    value: 'know_your_law',
    label: 'Know Your Law',
    description: 'Plain-language explainers on the rights and duties that affect daily life.',
    href: '/know-your-law'
  },
  {
    value: 'county_update',
    label: 'County Cases',
    description: 'Legal developments from the counties, from Nairobi to Turkana.',
    href: '/county-cases'
  },
  {
    value: 'opinion',
    label: 'Opinions',
    description: 'Considered commentary on where Kenyan law is heading and why it matters.',
    href: '/cases?category=opinion'
  }
];

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  case_brief: 'Case Brief',
  student_guide: 'Student Guide',
  county_update: 'County Update',
  know_your_law: 'Know Your Law',
  opinion: 'Opinion'
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  changes_requested: 'Changes requested',
  published: 'Published'
};

/** What an editor decided about a submission, in the author's words. */
export const DECISION_LABELS: Record<ReviewDecision, string> = {
  assigned: 'Assigned to an editor',
  changes_requested: 'Changes requested',
  published: 'Published',
  returned: 'Returned to draft'
};

/** The two kinds of outbound email the queue carries. */
export const NOTIFICATION_KIND_LABELS: Record<string, string> = {
  new_brief: 'Reader alert',
  review_decision: 'Author notice'
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  author: 'Author',
  reader: 'Reader'
};

export const COURTS = [
  'Supreme Court of Kenya',
  'Court of Appeal',
  'High Court',
  'Environment and Land Court',
  'Employment and Labour Relations Court',
  'Magistrates Court',
  'Court Martial',
  'Kadhi Court'
];

export const AREAS_OF_LAW = [
  'Constitutional',
  'Criminal',
  'Civil',
  'Land',
  'Employment',
  'Commercial',
  'Family',
  'Human Rights',
  'Tax',
  'Succession',
  'Intellectual Property',
  'Judicial Review'
];

export const COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Uasin Gishu',
  'Kiambu',
  'Machakos',
  'Kajiado',
  'Kakamega',
  'Bungoma',
  'Meru',
  'Nyeri',
  'Kilifi',
  'Kwale',
  'Garissa',
  'Turkana',
  'Kisii',
  'Homa Bay',
  'Migori',
  'Narok'
];

export const RESOURCE_CATEGORIES = ['Past Papers', 'Notes', 'Statutes', 'Case Digests'];

/** The topics a reader can follow. Each maps onto a column on a brief. */
export const FOLLOW_KINDS: FollowKind[] = ['area_of_law', 'jurisdiction', 'category', 'case'];

export const FOLLOW_KIND_LABELS: Record<FollowKind, string> = {
  area_of_law: 'Area of law',
  jurisdiction: 'Court or county',
  category: 'Section',
  case: 'Case citation'
};

export const ALERT_STATUS_LABELS: Record<string, string> = {
  pending: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
  skipped: 'Skipped'
};

/** A followed topic as a reader should read it. */
export function followLabel(kind: string, value: string) {
  if (kind === 'category') return CATEGORY_LABELS[value as PostCategory] ?? value;

  return value;
}

/** Where a reader can browse everything published under a followed topic. */
export function followHref(kind: string, value: string) {
  switch (kind) {
    case 'area_of_law':
      return `/cases?area=${encodeURIComponent(value)}`;
    case 'jurisdiction':
      return `/cases?jurisdiction=${encodeURIComponent(value)}`;
    case 'category':
      return CATEGORIES.find((category) => category.value === value)?.href ?? '/cases';
    case 'case':
      return `/cases?q=${encodeURIComponent(value)}`;
    default:
      return '/cases';
  }
}
