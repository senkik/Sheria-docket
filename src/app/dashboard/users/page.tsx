import { redirect } from 'next/navigation';

import { RoleSelect } from '@/components/RoleSelect';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { canManageUsers, requireProfile } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/constants';
import { getProfiles } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { UserRole } from '@/types/database';

export default async function DashboardUsersPage() {
  const profile = await requireProfile('/dashboard/users');

  if (!canManageUsers(profile.role)) redirect('/dashboard');

  const profiles = await getProfiles();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Users</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Roles decide what an account can do. Authors draft and submit, editors publish, and administrators manage
          everything including reader accounts and the resources library.
        </p>
      </header>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-medium">{row.full_name ?? 'Unnamed account'}</span>
                  {row.id === profile.id ? (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{row.email ?? '—'}</TableCell>
                <TableCell>
                  <RoleSelect userId={row.id} role={row.role} disabled={row.id === profile.id} />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(row.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Signed in as {ROLE_LABELS[profile.role as UserRole]}. You cannot change your own role.
      </p>
    </div>
  );
}
