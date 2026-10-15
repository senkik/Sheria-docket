'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookmarkCheck,
  Briefcase,
  ClipboardCheck,
  FilePlus2,
  Files,
  LayoutDashboard,
  Send,
  Users,
  UserCog,
  FolderDown
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/database';

interface DashboardSidebarProps {
  role: UserRole;
}

const LINKS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'editor', 'author', 'reader'] },
  { href: '/dashboard/review', label: 'Review Queue', icon: ClipboardCheck, roles: ['admin', 'editor'] },
  { href: '/dashboard/posts', label: 'My Posts', icon: Files, roles: ['admin', 'editor', 'author'] },
  { href: '/dashboard/posts/new', label: 'New Post', icon: FilePlus2, roles: ['admin', 'editor', 'author'] },
  {
    href: '/reading-list',
    label: 'Reading List',
    icon: BookmarkCheck,
    roles: ['admin', 'editor', 'author', 'reader']
  },
  { href: '/dashboard/alerts', label: 'Email Alerts', icon: Send, roles: ['admin', 'editor'] },
  { href: '/dashboard/resources', label: 'Resources', icon: FolderDown, roles: ['admin'] },
  { href: '/dashboard/internships', label: 'Internships', icon: Briefcase, roles: ['admin'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
  { href: '/dashboard/profile', label: 'My Profile', icon: UserCog, roles: ['admin', 'editor', 'author', 'reader'] }
];

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const links = LINKS.filter((link) => link.roles.includes(role));

  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Dashboard">
      {links.map((link) => {
        const active = link.href === '/dashboard' ? pathname === link.href : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
