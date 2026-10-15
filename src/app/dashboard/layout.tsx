import type { Metadata } from 'next';

import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Badge } from '@/components/ui/badge';
import { requireProfile } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/types/database';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile('/dashboard');

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-medium">{profile.full_name ?? profile.email}</p>
          <Badge variant="gold" className="mt-2">
            {ROLE_LABELS[profile.role as UserRole] ?? 'Reader'}
          </Badge>
        </div>

        <DashboardSidebar role={(profile.role as UserRole) ?? 'reader'} />
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
