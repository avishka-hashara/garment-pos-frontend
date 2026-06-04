import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SalesPoint } from '@/types'
import { formatCompact, formatCurrency } from '@/lib/utils'

interface TooltipPayloadEntry {
  name?: string
  value?: number
  color?: string
  dataKey?: string | number
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-display font-semibold">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 capitalize text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium tnum">
            {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function SalesTrendChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillWholesale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillStore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickFormatter={(v) => `$${formatCompact(v as number)}`}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
        <Area
          type="monotone"
          dataKey="wholesale"
          name="Wholesale"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fillWholesale)"
        />
        <Area
          type="monotone"
          dataKey="store"
          name="Store"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#fillStore)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
