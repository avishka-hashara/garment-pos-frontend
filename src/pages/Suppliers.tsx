import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Star, Truck, Clock, Banknote } from 'lucide-react'
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
import { useDirectoryStore } from '@/store/useDirectoryStore'
import type { Supplier } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

type Draft = Omit<Supplier, 'id' | 'materials'> & { materials: string }

const emptyDraft: Draft = {
  name: '',
  contact: '',
  phone: '',
  email: '',
  materials: '',
  leadTimeDays: 14,
  rating: 4,
  outstanding: 0,
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="size-3.5 fill-accent text-accent" />
      <span className="font-mono text-sm tabular-nums">{value.toFixed(1)}</span>
    </span>
  )
}

export function Suppliers() {
  const suppliers = useDirectoryStore((s) => s.suppliers)
  const addSupplier = useDirectoryStore((s) => s.addSupplier)
  const removeSupplier = useDirectoryStore((s) => s.removeSupplier)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const stats = useMemo(() => {
    const count = suppliers.length
    const avgLead = count ? Math.round(suppliers.reduce((a, s) => a + s.leadTimeDays, 0) / count) : 0
    const payable = suppliers.reduce((a, s) => a + s.outstanding, 0)
    const avgRating = count ? suppliers.reduce((a, s) => a + s.rating, 0) / count : 0
    return { count, avgLead, payable, avgRating }
  }, [suppliers])

  function save() {
    addSupplier({
      ...draft,
      materials: draft.materials.split(',').map((m) => m.trim()).filter(Boolean),
    })
    setDraft(emptyDraft)
    setOpen(false)
  }

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Supplier',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-[0.72rem] text-muted-foreground">{row.original.contact}</p>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.email}</p>
            <p className="font-mono text-[0.72rem] text-muted-foreground">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: 'materials',
        header: 'Supplies',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex max-w-[18rem] flex-wrap gap-1">
            {row.original.materials.slice(0, 3).map((m) => (
              <Badge key={m} variant="secondary" className="font-normal">{m}</Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'leadTimeDays',
        header: 'Lead Time',
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-muted-foreground">{getValue<number>()} d</span>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ getValue }) => <Stars value={getValue<number>()} />,
      },
      {
        accessorKey: 'outstanding',
        header: 'Payable',
        cell: ({ getValue }) => {
          const v = getValue<number>()
          return (
            <span className={`font-mono tabular-nums ${v > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formatCurrency(v)}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions onDelete={() => removeSupplier(row.original.id)} deleteLabel={row.original.name} />
        ),
      },
    ],
    [removeSupplier],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Suppliers"
        description="Mills, notions makers and dyehouses that feed raw materials into main stock."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add supplier
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Suppliers" value={formatNumber(stats.count)} icon={Truck} accent="primary" hint="active vendors" />
        <StatCard label="Avg Lead Time" value={`${stats.avgLead} days`} icon={Clock} accent="accent" hint="order to dock" />
        <StatCard label="Avg Rating" value={stats.avgRating.toFixed(1)} icon={Star} accent="success" hint="quality score" />
        <StatCard label="Payable" value={formatCurrency(stats.payable)} icon={Banknote} accent="destructive" hint="owed to vendors" />
      </div>

      <DataTable columns={columns} data={suppliers} searchKey="name" searchPlaceholder="Search suppliers…" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add supplier</DialogTitle>
            <DialogDescription>Register a new procurement vendor.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Company name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Anatolia Mills" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact person</Label>
              <Input value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Materials (comma separated)</Label>
              <Input value={draft.materials} onChange={(e) => setDraft({ ...draft, materials: e.target.value })} placeholder="Denim 12oz, Cotton Twill" />
            </div>
            <div className="space-y-1.5">
              <Label>Lead time (days)</Label>
              <Input type="number" value={draft.leadTimeDays} onChange={(e) => setDraft({ ...draft, leadTimeDays: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Rating (1–5)</Label>
              <Input type="number" step="0.1" min="1" max="5" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: +e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name}>Add supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
