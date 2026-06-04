import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Boxes, Layers, CircleAlert, Warehouse } from 'lucide-react'
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useStockStore, stockStatus } from '@/store/useStockStore'
import { useDirectoryStore } from '@/store/useDirectoryStore'
import type { StockItem, StockKind } from '@/types'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

type Draft = Omit<StockItem, 'id' | 'updatedAt'>

const emptyDraft: Draft = {
  sku: '',
  name: '',
  kind: 'raw',
  category: 'Fabric',
  unit: 'm',
  quantity: 0,
  reorderLevel: 0,
  unitCost: 0,
  location: '',
  supplierId: undefined,
}

export function MainStock() {
  const items = useStockStore((s) => s.items)
  const add = useStockStore((s) => s.add)
  const update = useStockStore((s) => s.update)
  const remove = useStockStore((s) => s.remove)
  const suppliers = useDirectoryStore((s) => s.suppliers)

  const [tab, setTab] = useState<'all' | StockKind>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<StockItem | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const stats = useMemo(() => {
    const value = items.reduce((a, i) => a + i.quantity * i.unitCost, 0)
    const skus = items.length
    const lowCount = items.filter((i) => stockStatus(i) !== 'healthy').length
    const finished = items.filter((i) => i.kind === 'finished').length
    return { value, skus, lowCount, finished }
  }, [items])

  const filtered = useMemo(
    () => (tab === 'all' ? items : items.filter((i) => i.kind === tab)),
    [items, tab],
  )

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft)
    setDialogOpen(true)
  }
  function openEdit(item: StockItem) {
    setEditing(item)
    const { id: _id, updatedAt: _u, ...rest } = item
    void _id
    void _u
    setDraft(rest)
    setDialogOpen(true)
  }
  function save() {
    if (editing) update(editing.id, draft)
    else add(draft)
    setDialogOpen(false)
  }

  const columns = useMemo<ColumnDef<StockItem>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'Item',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium">{row.original.name}</p>
            <p className="font-mono text-[0.72rem] text-muted-foreground">
              {row.original.sku} · {row.original.location}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'kind',
        header: 'Type',
        cell: ({ getValue }) => (
          <Badge variant={getValue<StockKind>() === 'finished' ? 'default' : 'secondary'}>
            {getValue<StockKind>() === 'finished' ? 'Finished' : 'Raw'}
          </Badge>
        ),
      },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'quantity',
        header: 'On Hand',
        cell: ({ row }) => (
          <span className="font-mono tabular-nums">
            {formatNumber(row.original.quantity)}{' '}
            <span className="text-muted-foreground">{row.original.unit}</span>
          </span>
        ),
      },
      {
        accessorKey: 'reorderLevel',
        header: 'Reorder @',
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatNumber(getValue<number>())}
          </span>
        ),
      },
      {
        id: 'value',
        header: 'Value',
        accessorFn: (r) => r.quantity * r.unitCost,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (r) => stockStatus(r),
        cell: ({ row }) => <StatusBadge status={stockStatus(row.original)} />,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatDate(getValue<string>())}
          </span>
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
            deleteLabel={`${row.original.name} (${row.original.sku})`}
          />
        ),
      },
    ],
    [remove],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Main Stock"
        description="Raw materials purchased in and finished goods returned from production live here."
        actions={
          <Button onClick={openCreate}>
            <Plus /> Add item
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Value" value={formatCurrency(stats.value)} icon={Boxes} accent="primary" hint="at cost" />
        <StatCard label="Distinct SKUs" value={formatNumber(stats.skus)} icon={Layers} accent="accent" hint="tracked items" />
        <StatCard label="Finished Goods" value={formatNumber(stats.finished)} icon={Warehouse} accent="success" hint="ready to sell" />
        <StatCard label="Need Reorder" value={formatNumber(stats.lowCount)} icon={CircleAlert} accent="destructive" hint="at or below level" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="name"
        searchPlaceholder="Search items, SKUs…"
        filters={
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
              <TabsTrigger value="finished">Finished</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit stock item' : 'Add stock item'}</DialogTitle>
            <DialogDescription>
              {editing ? `Updating ${editing.sku}` : 'Register a new raw material or finished good.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Item name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Denim 12oz — Indigo"
              />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input
                value={draft.sku}
                onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                placeholder="FB-DNM-12"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as StockKind })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw">Raw material</SelectItem>
                  <SelectItem value="finished">Finished good</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Fabric" />
            </div>
            <div className="space-y-1.5">
              <Label>Location / Bin</Label>
              <Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="A1-03" />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="m / pcs / kg" />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder level</Label>
              <Input type="number" value={draft.reorderLevel} onChange={(e) => setDraft({ ...draft, reorderLevel: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit cost (USD)</Label>
              <Input type="number" step="0.01" value={draft.unitCost} onChange={(e) => setDraft({ ...draft, unitCost: +e.target.value })} />
            </div>
            {draft.kind === 'raw' && (
              <div className="col-span-2 space-y-1.5">
                <Label>Supplier</Label>
                <Select
                  value={draft.supplierId ?? ''}
                  onValueChange={(v) => setDraft({ ...draft, supplierId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name || !draft.sku}>
              {editing ? 'Save changes' : 'Add item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
