import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompact, formatCurrency } from '@/lib/utils'

interface MixDatum {
  category: string
  value: number
}

const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
]

export function CategoryMixChart({ data }: { data: MixDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={232}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        barCategoryGap={14}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="category"
          tickLine={false}
          axisLine={false}
          width={84}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
        />
        <Tooltip
          cursor={{ fill: 'var(--secondary)', opacity: 0.5 }}
          formatter={(v) => [formatCurrency(Number(v)), 'Sales']}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--popover)',
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{
          position: 'right',
          fontSize: 11,
          fill: 'var(--muted-foreground)',
          formatter: (v) => `$${formatCompact(Number(v))}`,
        }}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
