import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Receipt, Wallet, Clock, TrendingDown } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExpenseStore } from '@/store/useExpenseStore'
import type { Expense, ExpenseCategory } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const CATEGORIES: ExpenseCategory[] = [
  'Payroll',
  'Rent',
  'Utilities',
  'Machinery',
  'Logistics',
  'Raw Materials',
  'Marketing',
  'Misc',
]

type Draft = Omit<Expense, 'id'> & { date: string }

const emptyDraft: Draft = {
  date: '2026-06-04',
  category: 'Misc',
  vendor: '',
  description: '',
  amount: 0,
  method: 'bank',
  status: 'paid',
}

export function Expenses() {
  const expenses = useExpenseStore((s) => s.expenses)
  const add = useExpenseStore((s) => s.add)
  const update = useExpenseStore((s) => s.update)
  const remove = useExpenseStore((s) => s.remove)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const stats = useMemo(() => {
    const total = expenses.reduce((a, e) => a + e.amount, 0)
    const paid = expenses.filter((e) => e.status === 'paid').reduce((a, e) => a + e.amount, 0)
    const pending = expenses.filter((e) => e.status === 'pending').reduce((a, e) => a + e.amount, 0)
    const byCat = new Map<string, number>()
    for (const e of expenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount)
    const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]
    return { total, paid, pending, topCategory: top?.[0] ?? '—', topValue: top?.[1] ?? 0 }
  }, [expenses])

  const filtered = useMemo(
    () => (categoryFilter === 'all' ? expenses : expenses.filter((e) => e.category === categoryFilter)),
    [expenses, categoryFilter],
  )

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft)
    setDialogOpen(true)
  }
  function openEdit(e: Expense) {
    setEditing(e)
    setDraft({ ...e, date: e.date.slice(0, 10) })
    setDialogOpen(true)
  }
  function save() {
    const payload = { ...draft, date: new Date(draft.date).toISOString() }
    if (editing) update(editing.id, payload)
    else add(payload)
    setDialogOpen(false)
  }

  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <div>
            <p className="text-sm">{formatDate(row.original.date)}</p>
            <p className="font-mono text-[0.72rem] text-muted-foreground">{row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        cell: ({ row }) => (
          <div className="max-w-[16rem]">
            <p className="font-medium">{row.original.vendor}</p>
            <p className="truncate text-[0.72rem] text-muted-foreground">{row.original.description}</p>
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ getValue }) => (
          <span className="text-sm capitalize text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium tabular-nums">{formatCurrency(getValue<number>(), true)}</span>
        ),
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
            deleteLabel={`expense ${row.original.id}`}
          />
        ),
      },
    ],
    [remove],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operating Costs"
        title="Expenses"
        description="Every operational cost across payroll, materials, logistics, machinery and overhead."
        actions={
          <Button onClick={openCreate}>
            <Plus /> Record expense
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Spend" value={formatCurrency(stats.total)} icon={Receipt} accent="destructive" hint="this period" />
        <StatCard label="Paid" value={formatCurrency(stats.paid)} icon={Wallet} accent="success" hint="settled" />
        <StatCard label="Pending" value={formatCurrency(stats.pending)} icon={Clock} accent="accent" hint="unsettled" />
        <StatCard label={`Top: ${stats.topCategory}`} value={formatCurrency(stats.topValue)} icon={TrendingDown} accent="primary" hint="largest category" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="vendor"
        searchPlaceholder="Search vendors, descriptions…"
        filters={
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.id}` : 'Record expense'}</DialogTitle>
            <DialogDescription>Log an operational cost against a category.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as ExpenseCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Vendor</Label>
              <Input value={draft.vendor} onChange={(e) => setDraft({ ...draft, vendor: e.target.value })} placeholder="Anatolia Mills" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What was this for?" />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (USD)</Label>
              <Input type="number" step="0.01" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={draft.method} onValueChange={(v) => setDraft({ ...draft, method: v as Expense['method'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as Expense['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.vendor || draft.amount <= 0}>
              {editing ? 'Save changes' : 'Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
