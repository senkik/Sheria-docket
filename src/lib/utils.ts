import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(new Date(value));
}

/** Builds a URL-safe slug. Kenyan citations contain brackets and commas, so they are stripped. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(input: string, length = 160) {
  if (input.length <= length) return input;
  return `${input.slice(0, length).trimEnd()}…`;
}

export function initials(name: string | null | undefined) {
  if (!name) return 'SD';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Each category has its own reading surface, so links follow the category. */
export function postHref(post: { slug: string; category: string | null }) {
  switch (post.category) {
    case 'case_brief':
    case 'opinion':
      return `/cases/${post.slug}`;
    case 'county_update':
      return `/county-cases/${post.slug}`;
    case 'student_guide':
      return `/student-hub/${post.slug}`;
    default:
      return `/know-your-law/${post.slug}`;
  }
}

/** Normalises a followed topic into a single comparable key. */
export function followKey(kind: string, value: string) {
  return `${kind}:${value.trim().toLowerCase()}`;
}

export function absoluteUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
