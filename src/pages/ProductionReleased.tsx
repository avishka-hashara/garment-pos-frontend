import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Factory, Hammer, CheckCircle2, PauseCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { RowActions } from '@/components/shared/RowActions'
import { StatusBadge } from '@/components/shared/StatusBadge'
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
import { useProductionStore } from '@/store/useProductionStore'
import type { WorkOrder, WorkOrderStatus } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'

const STATUSES: WorkOrderStatus[] = [
  'planned',
  'cutting',
  'stitching',
  'finishing',
  'completed',
  'on-hold',
]

type Draft = Omit<WorkOrder, 'id' | 'materials'>

const emptyDraft: Draft = {
  product: '',
  productSku: '',
  targetQty: 100,
  completedQty: 0,
  status: 'planned',
  line: 'Line A',
  supervisor: '',
  releasedAt: '2026-06-04T08:00:00Z',
  dueAt: '2026-06-18T17:00:00Z',
}

function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

export function ProductionReleased() {
  const orders = useProductionStore((s) => s.orders)
  const add = useProductionStore((s) => s.add)
  const update = useProductionStore((s) => s.update)
  const remove = useProductionStore((s) => s.remove)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkOrder | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const stats = useMemo(() => {
    const inFlight = orders.filter(
      (o) => o.status !== 'completed' && o.status !== 'on-hold',
    ).length
    const completed = orders.filter((o) => o.status === 'completed').length
    const onHold = orders.filter((o) => o.status === 'on-hold').length
    const unitsWip = orders
      .filter((o) => o.status !== 'completed')
      .reduce((a, o) => a + (o.targetQty - o.completedQty), 0)
    return { inFlight, completed, onHold, unitsWip }
  }, [orders])

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft)
    setDialogOpen(true)
  }
  function openEdit(o: WorkOrder) {
    setEditing(o)
    const { id: _id, materials: _m, ...rest } = o
    void _id
    void _m
    setDraft(rest)
    setDialogOpen(true)
  }
  function save() {
    if (editing) update(editing.id, draft)
    else add({ ...draft, materials: [] })
    setDialogOpen(false)
  }

  const columns = useMemo<ColumnDef<WorkOrder>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Work Order',
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm font-medium">{row.original.id}</p>
            <p className="text-[0.72rem] text-muted-foreground">
              {row.original.product}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'line',
        header: 'Line',
        cell: ({ row }) => (
          <div>
            <p className="text-sm">{row.original.line}</p>
            <p className="text-[0.72rem] text-muted-foreground">
              {row.original.supervisor}
            </p>
          </div>
        ),
      },
      {
        id: 'progress',
        header: 'Progress',
        accessorFn: (r) => r.completedQty / r.targetQty,
        cell: ({ row }) => {
          const o = row.original
          const pct = Math.round((o.completedQty / o.targetQty) * 100)
          return (
            <div className="w-36">
              <div className="mb-1 flex justify-between font-mono text-[0.7rem] tabular-nums text-muted-foreground">
                <span>
                  {formatNumber(o.completedQty)}/{formatNumber(o.targetQty)}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'materials',
        header: 'Materials',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.materials.length} drawn
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        accessorKey: 'releasedAt',
        header: 'Released',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
        ),
      },
      {
        accessorKey: 'dueAt',
        header: 'Due',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            onEdit={() => openEdit(row.original)}
            onDelete={() => remove(row.original.id)}
            deleteLabel={`work order ${row.original.id}`}
          />
        ),
      },
    ],
    [remove],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Production"
        title="Production Released"
        description="Work orders that have pulled materials from main stock. Track each batch from cutting through finishing."
        actions={
          <Button onClick={openCreate}>
            <Plus /> New work order
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="In Production" value={formatNumber(stats.inFlight)} icon={Factory} accent="primary" hint="active batches" />
        <StatCard label="Units WIP" value={formatNumber(stats.unitsWip)} icon={Hammer} accent="accent" hint="left to finish" />
        <StatCard label="Completed" value={formatNumber(stats.completed)} icon={CheckCircle2} accent="success" hint="returned to stock" />
        <StatCard label="On Hold" value={formatNumber(stats.onHold)} icon={PauseCircle} accent="destructive" hint="blocked batches" />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="product"
        searchPlaceholder="Search by product or WO…"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.id}` : 'New work order'}</DialogTitle>
            <DialogDescription>
              Release a batch to the floor and track its progress.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Input value={draft.product} onChange={(e) => setDraft({ ...draft, product: e.target.value })} placeholder="Heritage Denim Jacket" />
            </div>
            <div className="space-y-1.5">
              <Label>Product SKU</Label>
              <Input value={draft.productSku} onChange={(e) => setDraft({ ...draft, productSku: e.target.value })} placeholder="GAR-JKT-DNM" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Target qty</Label>
              <Input type="number" value={draft.targetQty} onChange={(e) => setDraft({ ...draft, targetQty: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Completed qty</Label>
              <Input type="number" value={draft.completedQty} onChange={(e) => setDraft({ ...draft, completedQty: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as WorkOrderStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Line</Label>
              <Select value={draft.line} onValueChange={(v) => setDraft({ ...draft, line: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Line A', 'Line B', 'Line C', 'Line D'].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Supervisor</Label>
              <Input value={draft.supervisor} onChange={(e) => setDraft({ ...draft, supervisor: e.target.value })} placeholder="Rosa Mendel" />
            </div>
            <div className="space-y-1.5">
              <Label>Released</Label>
              <Input
                type="date"
                value={toDateInput(draft.releasedAt)}
                onChange={(e) => setDraft({ ...draft, releasedAt: new Date(e.target.value).toISOString() })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due</Label>
              <Input
                type="date"
                value={toDateInput(draft.dueAt)}
                onChange={(e) => setDraft({ ...draft, dueAt: new Date(e.target.value).toISOString() })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.product || !draft.productSku}>
              {editing ? 'Save changes' : 'Release order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
