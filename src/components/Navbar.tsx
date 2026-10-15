'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookmarkCheck, Gavel, LayoutDashboard, LogOut, Menu, Send, User, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NAV_LINKS, ROLE_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { cn, initials } from '@/lib/utils';
import type { Profile, UserRole } from '@/types/database';

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setSigningOut(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-light/40 bg-navy text-white">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Sheria Docket home">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy">
            <Gavel className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight">Sheria Docket</span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Law. Simplified. Localized.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.split('?')[0]);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white',
                  active && 'bg-white/10 text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border border-white/20 py-1 pl-1 pr-3 transition-colors hover:border-gold"
                  aria-label="Account menu"
                >
                  <Avatar className="h-8 w-8">
                    {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
                    <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{profile.full_name?.split(' ')[0] ?? 'Reader'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-sm">{profile.full_name ?? 'Sheria Docket reader'}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {ROLE_LABELS[profile.role as UserRole] ?? 'Reader'}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/reading-list" className="flex items-center gap-2">
                    <BookmarkCheck className="h-4 w-4" />
                    Reading list
                  </Link>
                </DropdownMenuItem>
                {profile.role === 'admin' || profile.role === 'editor' ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/alerts" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Email alerts
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={signingOut}
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleSignOut();
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="gold" size="sm">
                <Link href="/signup">Create account</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-navy lg:hidden">
          <nav className="container flex flex-col py-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                {link.label}
              </Link>              ))}

            {profile ? (
              <Link
                href="/reading-list"
                className="rounded-md px-2 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Reading list
              </Link>
            ) : null}

            <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
              {profile ? (
                <>
                  <Button asChild variant="gold" size="sm" className="flex-1">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={() => void handleSignOut()}
                    disabled={signingOut}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="gold" size="sm" className="flex-1">
                    <Link href="/signup">Create account</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
