'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/types/database';

interface RoleSelectProps {
  userId: string;
  role: string;
  disabled?: boolean;
}

const ROLES: UserRole[] = ['admin', 'editor', 'author', 'reader'];

export function RoleSelect({ userId, role, disabled }: RoleSelectProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function handleChange(nextRole: string) {
    setPending(true);

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: nextRole })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'The role could not be changed.');

      toast({
        variant: 'success',
        title: 'Role updated',
        description: `This account is now ${ROLE_LABELS[nextRole as UserRole].toLowerCase()}.`
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Select value={role} onValueChange={(value) => void handleChange(value)} disabled={pending || disabled}>
      <SelectTrigger className="h-9 w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((value) => (
          <SelectItem key={value} value={value}>
            {ROLE_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
