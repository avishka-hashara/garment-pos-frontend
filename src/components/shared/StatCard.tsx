import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: number // percent change
  hint?: string
  accent?: 'primary' | 'accent' | 'success' | 'destructive'
}

const accentMap = {
  primary: 'text-primary bg-primary/10',
  accent: 'text-accent-foreground bg-accent/15',
  success: 'text-[var(--success)] bg-[color-mix(in_oklch,var(--success)_14%,transparent)]',
  destructive: 'text-destructive bg-destructive/12',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  accent = 'primary',
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0
  return (
    <Card className="relative gap-0 overflow-hidden p-5">
      <div className="card-grain pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex items-start justify-between">
        <p className="eyebrow">{label}</p>
        <div className={cn('grid size-9 place-items-center rounded-lg', accentMap[accent])}>
          <Icon className="size-[1.05rem]" />
        </div>
      </div>
      <p className="relative mt-3 font-display text-[1.9rem] font-bold leading-none tnum">
        {value}
      </p>
      <div className="relative mt-2.5 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tnum',
              positive
                ? 'bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]'
                : 'bg-destructive/12 text-destructive',
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  )
}
