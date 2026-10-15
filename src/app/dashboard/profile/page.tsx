import { ProfileForm } from '@/components/ProfileForm';
import { Badge } from '@/components/ui/badge';
import { requireProfile } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { UserRole } from '@/types/database';

export default async function DashboardProfilePage() {
  const profile = await requireProfile('/dashboard/profile');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">My profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Member since {formatDate(profile.created_at)}</p>
        </div>
        <Badge variant="gold">{ROLE_LABELS[profile.role as UserRole] ?? 'Reader'}</Badge>
      </header>

      <ProfileForm profile={profile} />
    </div>
  );
}
