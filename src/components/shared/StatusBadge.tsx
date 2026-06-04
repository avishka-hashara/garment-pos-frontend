import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'accent'

const map: Record<string, { label: string; variant: Variant }> = {
  // stock
  healthy: { label: 'Healthy', variant: 'success' },
  low: { label: 'Low', variant: 'warning' },
  critical: { label: 'Critical', variant: 'destructive' },
  out: { label: 'Out of stock', variant: 'destructive' },
  // work orders
  planned: { label: 'Planned', variant: 'secondary' },
  cutting: { label: 'Cutting', variant: 'accent' },
  stitching: { label: 'Stitching', variant: 'accent' },
  finishing: { label: 'Finishing', variant: 'accent' },
  completed: { label: 'Completed', variant: 'success' },
  'on-hold': { label: 'On hold', variant: 'warning' },
  // sales
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  unpaid: { label: 'Unpaid', variant: 'destructive' },
  returned: { label: 'Returned', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'warning' },
  // users
  active: { label: 'Active', variant: 'success' },
  invited: { label: 'Invited', variant: 'secondary' },
  suspended: { label: 'Suspended', variant: 'destructive' },
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const cfg = map[status] ?? { label: status, variant: 'outline' as Variant }
  return (
    <Badge variant={cfg.variant} className={cn('gap-1.5', className)}>
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </Badge>
  )
}
