import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';

/** One status pill for every dashboard surface, so the colours stay honest. */
export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;

  if (status === 'published') return <Badge variant="success">{label}</Badge>;
  if (status === 'pending_review') return <Badge variant="warning">{label}</Badge>;
  if (status === 'changes_requested') {
    return (
      <Badge variant="outline" className="border-destructive text-destructive">
        {label}
      </Badge>
    );
  }

  return <Badge variant="muted">{label}</Badge>;
}
