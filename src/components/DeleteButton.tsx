'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DeleteButtonProps {
  endpoint: string;
  id: string;
  confirmMessage: string;
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
}

export function DeleteButton({
  endpoint,
  id,
  confirmMessage,
  label = 'Delete',
  size = 'sm',
  variant = 'ghost'
}: DeleteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;

    setPending(true);

    try {
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'The item could not be deleted.');

      toast({ variant: 'success', title: 'Deleted', description: 'The item has been removed.' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={() => void handleDelete()}
      disabled={pending}
      className="text-destructive hover:text-destructive"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {label}
    </Button>
  );
}
