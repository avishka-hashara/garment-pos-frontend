import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, ShoppingCart, DollarSign, Clock, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { RowActions } from '@/components/shared/RowActions'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSalesStore } from '@/store/useSalesStore'
import { useDirectoryStore } from '@/store/useDirectoryStore'
import type { Sale, SaleLine, SaleStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

function deriveStatus(total: number, paid: number): SaleStatus {
  if (paid <= 0) return 'unpaid'
  if (paid < total) return 'partial'
  return 'paid'
}

interface Draft {
  customerId: string
  customer: string
  date: string
  channel: 'wholesale' | 'store'
  lines: SaleLine[]
  discount: number
  taxRate: number
  amountPaid: number
}

const emptyDraft: Draft = {
  customerId: '',
  customer: '',
  date: '2026-06-04',
  channel: 'wholesale',
  lines: [{ productSku: '', product: '', qty: 1, unitPrice: 0 }],
  discount: 0,
  taxRate: 8,
  amountPaid: 0,
}

export function Sales() {
  const sales = useSalesStore((s) => s.sales)
  const add = useSalesStore((s) => s.add)
  const update = useSalesStore((s) => s.update)
  const remove = useSalesStore((s) => s.remove)
  const customers = useDirectoryStore((s) => s.customers)
  const products = useDirectoryStore((s) => s.products)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Sale | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const stats = useMemo(() => {
    const revenue = sales
      .filter((s) => s.status !== 'returned')
      .reduce((a, s) => a + s.total, 0)
    const collected = sales.reduce((a, s) => a + s.amountPaid, 0)
    const outstanding = sales.reduce((a, s) => a + (s.total - s.amountPaid), 0)
    const returns = sales.filter((s) => s.status === 'returned').length
    return { revenue, collected, outstanding, returns }
  }, [sales])

  const totals = useMemo(() => {
    const subtotal = draft.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0)
    const tax = Math.round((subtotal - draft.discount) * (draft.taxRate / 100) * 100) / 100
    const total = Math.max(0, subtotal - draft.discount + tax)
    return { subtotal, tax, total }
  }, [draft.lines, draft.discount, draft.taxRate])

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft)
    setDialogOpen(true)
  }
  function openEdit(sale: Sale) {
    setEditing(sale)
    const taxRate = sale.subtotal - sale.discount > 0
      ? Math.round((sale.tax / (sale.subtotal - sale.discount)) * 100)
      : 0
    setDraft({
      customerId: sale.customerId,
      customer: sale.customer,
      date: sale.date.slice(0, 10),
      channel: sale.channel,
      lines: sale.lines.length ? sale.lines : emptyDraft.lines,
      discount: sale.discount,
      taxRate,
      amountPaid: sale.amountPaid,
    })
    setDialogOpen(true)
  }

  function save() {
    const payload: Omit<Sale, 'id'> = {
      customerId: draft.customerId,
      customer: draft.customer,
      date: new Date(draft.date).toISOString(),
      channel: draft.channel,
      lines: draft.lines.filter((l) => l.product),
      subtotal: totals.subtotal,
      discount: draft.discount,
      tax: totals.tax,
      total: totals.total,
      amountPaid: draft.amountPaid,
      status: editing?.status === 'returned'
        ? 'returned'
        : deriveStatus(totals.total, draft.amountPaid),
    }
    if (editing) update(editing.id, payload)
    else add(payload)
    setDialogOpen(false)
  }

  function setLine(idx: number, patch: Partial<SaleLine>) {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }))
  }
  function pickProduct(idx: number, sku: string) {
    const p = products.find((p) => p.sku === sku)
    if (p) setLine(idx, { productSku: p.sku, product: p.name, unitPrice: p.wholesalePrice })
  }

  const columns = useMemo<ColumnDef<Sale>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Invoice',
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm font-medium">{row.original.id}</p>
            <p className="text-[0.72rem] text-muted-foreground">
              {formatDate(row.original.date)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.customer}</p>
            <p className="text-[0.72rem] text-muted-foreground">
              {row.original.lines.reduce((a, l) => a + l.qty, 0)} units ·{' '}
              {row.original.lines.length} lines
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ getValue }) => (
          <Badge variant={getValue<string>() === 'wholesale' ? 'default' : 'secondary'} className="capitalize">
            {getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium tabular-nums">
            {formatCurrency(getValue<number>(), true)}
          </span>
        ),
      },
      {
        id: 'balance',
        header: 'Balance',
        accessorFn: (r) => r.total - r.amountPaid,
        cell: ({ getValue }) => {
          const v = getValue<number>()
          return (
            <span className={`font-mono tabular-nums ${v > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formatCurrency(v, true)}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            onEdit={() => openEdit(row.original)}
            onDelete={() => remove(row.original.id)}
            deleteLabel={`invoice ${row.original.id}`}
          />
        ),
      },
    ],
    [remove, products],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Revenue"
        title="Sales & Wholesale"
        description="Finished goods sold to boutiques, department stores and distributors."
        actions={
          <Button onClick={openCreate}>
            <Plus /> New invoice
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={ShoppingCart} accent="primary" hint="net of returns" />
        <StatCard label="Collected" value={formatCurrency(stats.collected)} icon={DollarSign} accent="success" hint="cash received" />
        <StatCard label="Outstanding" value={formatCurrency(stats.outstanding)} icon={Clock} accent="destructive" hint="awaiting payment" />
        <StatCard label="Returns" value={String(stats.returns)} icon={RotateCcw} accent="accent" hint="this period" />
      </div>

      <DataTable
        columns={columns}
        data={sales}
        searchKey="customer"
        searchPlaceholder="Search invoices, customers…"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.id}` : 'New invoice'}</DialogTitle>
            <DialogDescription>Sell finished goods to a wholesale account or store.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select
                value={draft.customerId}
                onValueChange={(v) => {
                  const c = customers.find((c) => c.id === v)
                  setDraft({ ...draft, customerId: v, customer: c?.name ?? '' })
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select value={draft.channel} onValueChange={(v) => setDraft({ ...draft, channel: v as Draft['channel'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line items</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    lines: [...d.lines, { productSku: '', product: '', qty: 1, unitPrice: 0 }],
                  }))
                }
              >
                <Plus /> Add line
              </Button>
            </div>
            <div className="space-y-2">
              {draft.lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={line.productSku} onValueChange={(v) => pickProduct(idx, v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.sku} value={p.sku}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="w-20"
                    value={line.qty}
                    onChange={(e) => setLine(idx, { qty: +e.target.value })}
                    aria-label="Quantity"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    className="w-24 font-mono"
                    value={line.unitPrice}
                    onChange={(e) => setLine(idx, { unitPrice: +e.target.value })}
                    aria-label="Unit price"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        lines: d.lines.length > 1 ? d.lines.filter((_, i) => i !== idx) : d.lines,
                      }))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Discount (USD)</Label>
                <Input type="number" step="0.01" value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: +e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tax rate (%)</Label>
                <Input type="number" step="0.1" value={draft.taxRate} onChange={(e) => setDraft({ ...draft, taxRate: +e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Amount paid (USD)</Label>
                <Input type="number" step="0.01" value={draft.amountPaid} onChange={(e) => setDraft({ ...draft, amountPaid: +e.target.value })} />
              </div>
            </div>
            <div className="space-y-2 rounded-lg border bg-secondary/30 p-4 text-sm">
              <Row label="Subtotal" value={formatCurrency(totals.subtotal, true)} />
              <Row label="Discount" value={`– ${formatCurrency(draft.discount, true)}`} />
              <Row label={`Tax (${draft.taxRate}%)`} value={formatCurrency(totals.tax, true)} />
              <Separator />
              <Row label="Total" value={formatCurrency(totals.total, true)} bold />
              <Row label="Balance due" value={formatCurrency(Math.max(0, totals.total - draft.amountPaid), true)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.customerId || !draft.lines.some((l) => l.product)}>
              {editing ? 'Save changes' : 'Create invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
      <span className={`font-mono tabular-nums ${bold ? 'text-base font-semibold' : ''}`}>{value}</span>
    </div>
  )
}
