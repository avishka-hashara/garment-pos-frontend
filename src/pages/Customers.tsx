import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Store, Users, CreditCard, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { RowActions } from '@/components/shared/RowActions'
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
import { useDirectoryStore } from '@/store/useDirectoryStore'
import type { Customer } from '@/types'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

const TYPES: Customer['type'][] = ['Boutique', 'Department Store', 'Online', 'Distributor']

type Draft = Omit<Customer, 'id' | 'balance' | 'ytdSales'>

const emptyDraft: Draft = {
  name: '',
  type: 'Boutique',
  contact: '',
  phone: '',
  city: '',
  creditLimit: 25000,
}

export function Customers() {
  const customers = useDirectoryStore((s) => s.customers)
  const addCustomer = useDirectoryStore((s) => s.addCustomer)
  const removeCustomer = useDirectoryStore((s) => s.removeCustomer)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const stats = useMemo(() => {
    const count = customers.length
    const ytd = customers.reduce((a, c) => a + c.ytdSales, 0)
    const balance = customers.reduce((a, c) => a + c.balance, 0)
    const credit = customers.reduce((a, c) => a + c.creditLimit, 0)
    return { count, ytd, balance, credit }
  }, [customers])

  function save() {
    addCustomer({ ...draft, balance: 0, ytdSales: 0 })
    setDraft(emptyDraft)
    setOpen(false)
  }

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-[0.72rem] text-muted-foreground">
              {row.original.contact} · {row.original.city}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: 'credit',
        header: 'Credit Used',
        accessorFn: (r) => (r.creditLimit ? r.balance / r.creditLimit : 0),
        cell: ({ row }) => {
          const c = row.original
          const pct = c.creditLimit ? Math.round((c.balance / c.creditLimit) * 100) : 0
          return (
            <div className="w-32">
              <div className="mb-1 flex justify-between font-mono text-[0.7rem] tabular-nums text-muted-foreground">
                <span>{formatCurrency(c.balance)}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className={cn('h-full rounded-full', pct > 75 ? 'bg-destructive' : pct > 40 ? 'bg-warning' : 'bg-success')}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'ytdSales',
        header: 'YTD Sales',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium tabular-nums">{formatCurrency(getValue<number>())}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions onDelete={() => removeCustomer(row.original.id)} deleteLabel={row.original.name} />
        ),
      },
    ],
    [removeCustomer],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="Customers & Stores"
        description="Wholesale accounts and retail stores that buy finished garments."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add customer
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Accounts" value={formatNumber(stats.count)} icon={Users} accent="primary" hint="active buyers" />
        <StatCard label="YTD Sales" value={formatCurrency(stats.ytd)} icon={TrendingUp} accent="success" hint="all accounts" />
        <StatCard label="Open Balance" value={formatCurrency(stats.balance)} icon={CreditCard} accent="destructive" hint="receivables" />
        <StatCard label="Credit Extended" value={formatCurrency(stats.credit)} icon={Store} accent="accent" hint="total limits" />
      </div>

      <DataTable columns={columns} data={customers} searchKey="name" searchPlaceholder="Search customers…" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
            <DialogDescription>Register a wholesale account or store.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Account name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Harbor & Co." />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as Customer['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Input value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Credit limit (USD)</Label>
              <Input type="number" value={draft.creditLimit} onChange={(e) => setDraft({ ...draft, creditLimit: +e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name}>Add customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
