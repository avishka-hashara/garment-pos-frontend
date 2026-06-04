import { useMemo, useState } from 'react'
import { Printer, FileBarChart, CalendarRange } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { useSalesStore } from '@/store/useSalesStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useProductionStore } from '@/store/useProductionStore'
import { useStockStore } from '@/store/useStockStore'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

type ReportType = 'pnl' | 'sales' | 'expenses' | 'production'

const presets: Record<string, { from: string; to: string; label: string }> = {
  mtd: { from: '2026-06-01', to: '2026-06-04', label: 'Month to date' },
  last30: { from: '2026-05-05', to: '2026-06-04', label: 'Last 30 days' },
  q2: { from: '2026-04-01', to: '2026-06-30', label: 'Q2 2026' },
  ytd: { from: '2026-01-01', to: '2026-06-04', label: 'Year to date' },
}

function within(iso: string, from: string, to: string) {
  const d = iso.slice(0, 10)
  return d >= from && d <= to
}

export function Reports() {
  const sales = useSalesStore((s) => s.sales)
  const expenses = useExpenseStore((s) => s.expenses)
  const orders = useProductionStore((s) => s.orders)
  const stock = useStockStore((s) => s.items)

  const [type, setType] = useState<ReportType>('pnl')
  const [preset, setPreset] = useState('last30')
  const [from, setFrom] = useState(presets.last30.from)
  const [to, setTo] = useState(presets.last30.to)

  function applyPreset(key: string) {
    setPreset(key)
    if (presets[key]) {
      setFrom(presets[key].from)
      setTo(presets[key].to)
    }
  }

  const data = useMemo(() => {
    const s = sales.filter((x) => within(x.date, from, to))
    const e = expenses.filter((x) => within(x.date, from, to))
    const o = orders.filter((x) => within(x.releasedAt, from, to))

    const revenue = s.filter((x) => x.status !== 'returned').reduce((a, x) => a + x.total, 0)
    const collected = s.reduce((a, x) => a + x.amountPaid, 0)
    const expenseTotal = e.reduce((a, x) => a + x.amount, 0)
    const cogs = o.reduce((a, wo) => a + wo.completedQty * 0, 0) // placeholder kept 0
    const unitsSold = s.reduce((a, x) => a + x.lines.reduce((b, l) => b + l.qty, 0), 0)
    const unitsProduced = o.reduce((a, wo) => a + wo.completedQty, 0)

    // expenses grouped by category
    const byCat = new Map<string, number>()
    for (const x of e) byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amount)
    const expenseRows = [...byCat.entries()].sort((a, b) => b[1] - a[1])

    // sales grouped by customer
    const byCust = new Map<string, { total: number; units: number }>()
    for (const x of s) {
      const cur = byCust.get(x.customer) ?? { total: 0, units: 0 }
      cur.total += x.total
      cur.units += x.lines.reduce((b, l) => b + l.qty, 0)
      byCust.set(x.customer, cur)
    }
    const salesRows = [...byCust.entries()].sort((a, b) => b[1].total - a[1].total)

    return {
      s, e, o,
      revenue, collected, expenseTotal, cogs,
      unitsSold, unitsProduced,
      grossProfit: revenue - expenseTotal,
      expenseRows, salesRows,
    }
  }, [sales, expenses, orders, from, to])

  const stockValue = useMemo(
    () => stock.reduce((a, i) => a + i.quantity * i.unitCost, 0),
    [stock],
  )

  const titleMap: Record<ReportType, string> = {
    pnl: 'Profit & Loss Summary',
    sales: 'Sales Report',
    expenses: 'Expense Report',
    production: 'Production Report',
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Generate date-ranged summaries for sales, expenses, production and P&L — then print or export."
        actions={
          <Button onClick={() => window.print()} className="no-print">
            <Printer /> Print / PDF
          </Button>
        }
      />

      {/* controls */}
      <Card className="no-print">
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-end">
          <div className="space-y-1.5">
            <Label>Report</Label>
            <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pnl">Profit & Loss</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quick range</Label>
            <Select value={preset} onValueChange={applyPreset}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(presets).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" value={from} className="w-40" onChange={(e) => { setFrom(e.target.value); setPreset('custom') }} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input type="date" value={to} className="w-40" onChange={(e) => { setTo(e.target.value); setPreset('custom') }} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground lg:ml-auto">
            <CalendarRange className="size-4" />
            <span className="tnum">{formatDate(from)} → {formatDate(to)}</span>
          </div>
        </CardContent>
      </Card>

      {/* printable sheet */}
      <Card className="print-sheet">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                <FileBarChart className="size-5" />
              </span>
              <div>
                <CardTitle className="font-display text-xl">{titleMap[type]}</CardTitle>
                <CardDescription>
                  Loomworks Garment Co. · {formatDate(from)} – {formatDate(to)}
                </CardDescription>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-mono">Generated {formatDate('2026-06-04T00:00:00Z')}</p>
              <p>Confidential</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* headline metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label="Revenue" value={formatCurrency(data.revenue)} />
            <Metric label="Expenses" value={formatCurrency(data.expenseTotal)} />
            <Metric label="Net" value={formatCurrency(data.grossProfit)} accent={data.grossProfit >= 0 ? 'pos' : 'neg'} />
            <Metric label="Stock Value" value={formatCurrency(stockValue)} />
          </div>

          {(type === 'pnl' || type === 'sales') && (
            <section className="space-y-3">
              <h3 className="font-display text-base font-semibold">Sales by Customer</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.salesRows.map(([name, v]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(v.units)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(v.total)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {data.revenue ? Math.round((v.total / data.revenue) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.salesRows.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No sales in range.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </section>
          )}

          {(type === 'pnl' || type === 'expenses') && (
            <section className="space-y-3">
              <h3 className="font-display text-base font-semibold">Expenses by Category</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expenseRows.map(([cat, amt]) => (
                    <TableRow key={cat}>
                      <TableCell className="font-medium">{cat}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(amt)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {data.expenseTotal ? Math.round((amt / data.expenseTotal) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.expenseRows.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No expenses in range.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </section>
          )}

          {type === 'production' && (
            <section className="space-y-3">
              <h3 className="font-display text-base font-semibold">Work Orders Released</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.o.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-mono">{wo.id}</TableCell>
                      <TableCell className="font-medium">{wo.product}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{wo.status.replace('-', ' ')}</Badge></TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(wo.completedQty)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(wo.targetQty)}</TableCell>
                    </TableRow>
                  ))}
                  {data.o.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No work orders released in range.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </section>
          )}

          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {type === 'production'
                ? `${formatNumber(data.unitsProduced)} units produced · ${formatNumber(data.unitsSold)} units sold`
                : `${formatNumber(data.unitsSold)} units sold across ${data.s.length} invoices`}
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground">Net position</span>
              <span className={`font-display text-xl font-bold tnum ${data.grossProfit >= 0 ? 'text-[var(--success)]' : 'text-destructive'}`}>
                {formatCurrency(data.grossProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'pos' | 'neg'
}) {
  return (
    <div className="rounded-lg border bg-secondary/30 p-4">
      <p className="eyebrow">{label}</p>
      <p
        className={`mt-1 font-display text-xl font-bold tnum ${
          accent === 'pos' ? 'text-[var(--success)]' : accent === 'neg' ? 'text-destructive' : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}
