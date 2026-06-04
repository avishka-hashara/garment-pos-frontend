import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  Factory,
  Receipt,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { SalesTrendChart } from '@/components/charts/SalesTrendChart'
import { CategoryMixChart } from '@/components/charts/CategoryMixChart'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStockStore, stockStatus } from '@/store/useStockStore'
import { useProductionStore } from '@/store/useProductionStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useSalesStore } from '@/store/useSalesStore'
import { salesTrend, categoryMix } from '@/data/salesTrend'
import { formatCurrency, formatNumber, formatDate, cn } from '@/lib/utils'

const NOW = new Date('2026-06-04T12:00:00Z')
const WEEK_AGO = new Date(NOW.getTime() - 7 * 24 * 3600 * 1000)

export function Dashboard() {
  const items = useStockStore((s) => s.items)
  const orders = useProductionStore((s) => s.orders)
  const expenses = useExpenseStore((s) => s.expenses)
  const sales = useSalesStore((s) => s.sales)

  const kpis = useMemo(() => {
    const stockValue = items.reduce((a, i) => a + i.quantity * i.unitCost, 0)
    const pendingOrders = orders.filter((o) => o.status !== 'completed').length
    const weeklyReleases = orders.filter(
      (o) => new Date(o.releasedAt) >= WEEK_AGO,
    ).length
    const expenseTotal = expenses.reduce((a, e) => a + e.amount, 0)
    return { stockValue, pendingOrders, weeklyReleases, expenseTotal }
  }, [items, orders, expenses])

  const lowStock = useMemo(
    () =>
      items
        .map((i) => ({ ...i, status: stockStatus(i) }))
        .filter((i) => i.status !== 'healthy')
        .sort((a, b) => a.quantity / a.reorderLevel - b.quantity / b.reorderLevel)
        .slice(0, 6),
    [items],
  )

  const activeLines = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'completed' && o.status !== 'planned')
        .slice(0, 5),
    [orders],
  )

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5),
    [sales],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wednesday · 04 June 2026"
        title="Production Floor Overview"
        description="Live snapshot of stock, work-in-progress, and the order book across the mill."
        actions={
          <Button asChild variant="outline">
            <Link to="/reports">
              <TrendingUp /> View reports
            </Link>
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Stock Value"
          value={formatCurrency(kpis.stockValue)}
          icon={Boxes}
          delta={6.2}
          hint="raw + finished"
          accent="primary"
        />
        <StatCard
          label="Pending Orders"
          value={formatNumber(kpis.pendingOrders)}
          icon={Factory}
          delta={-2}
          hint="work orders in flight"
          accent="accent"
        />
        <StatCard
          label="Weekly Releases"
          value={formatNumber(kpis.weeklyReleases)}
          icon={PackageCheck}
          delta={14}
          hint="materials → production"
          accent="success"
        />
        <StatCard
          label="Expenses (MTD)"
          value={formatCurrency(kpis.expenseTotal)}
          icon={Receipt}
          delta={3.4}
          hint="all categories"
          accent="destructive"
        />
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-lg">Sales Trend</CardTitle>
              <CardDescription>Wholesale vs. store · trailing 12 weeks</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-chart-1" /> Wholesale
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-chart-2" /> Store
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={salesTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Category Mix</CardTitle>
            <CardDescription>Revenue by line · this month</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryMixChart data={categoryMix} />
          </CardContent>
        </Card>
      </div>

      {/* alerts + activity row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* low stock alerts */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-warning/15 text-[color-mix(in_oklch,var(--warning)_65%,black)]">
                <AlertTriangle className="size-4" />
              </span>
              <CardTitle className="text-base">Low-stock Alerts</CardTitle>
            </div>
            <Badge variant="warning">{lowStock.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {lowStock.map((item) => {
              const pct = Math.min(100, (item.quantity / item.reorderLevel) * 100)
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="font-mono text-[0.7rem] text-muted-foreground">
                        {item.sku} · {item.location}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.status === 'out' || item.status === 'critical'
                            ? 'bg-destructive'
                            : 'bg-warning',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground">
                      {formatNumber(item.quantity)}/{formatNumber(item.reorderLevel)}
                    </span>
                  </div>
                </div>
              )
            })}
            <Button asChild variant="ghost" size="sm" className="w-full justify-between">
              <Link to="/stock">
                Manage stock <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* active production lines */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">On the Floor</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/production">All orders</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLines.map((o) => {
              const pct = Math.round((o.completedQty / o.targetQty) * 100)
              return (
                <div key={o.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{o.product}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <p className="font-mono text-[0.7rem] text-muted-foreground">
                    {o.id} · {o.line} · {formatNumber(o.completedQty)}/
                    {formatNumber(o.targetQty)} pcs
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* recent sales */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/sales">All sales</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentSales.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.customer}</p>
                  <p className="font-mono text-[0.7rem] text-muted-foreground">
                    {s.id} · {formatDate(s.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tnum">
                    {formatCurrency(s.total)}
                  </p>
                  <StatusBadge status={s.status} className="mt-0.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
