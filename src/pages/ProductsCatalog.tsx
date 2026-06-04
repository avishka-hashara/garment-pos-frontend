import { useMemo, useState } from 'react'
import { Plus, Shirt, Search, TrendingUp, Layers, Boxes } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { RowActions } from '@/components/shared/RowActions'
import { useDirectoryStore } from '@/store/useDirectoryStore'
import type { Product } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

type Draft = Omit<Product, 'id' | 'sizes' | 'colors'> & { sizes: string; colors: string }

const emptyDraft: Draft = {
  sku: '',
  name: '',
  category: 'Knitwear',
  fabric: '',
  sizes: 'S, M, L, XL',
  colors: 'Black',
  wholesalePrice: 0,
  cost: 0,
  inStock: 0,
  active: true,
}

const swatch: Record<string, string> = {
  Indigo: '#34406b',
  'Washed Black': '#2b2a30',
  Sand: '#d8c39c',
  Stone: '#cbc3b3',
  Olive: '#6b6f3e',
  White: '#f4f2ec',
  Sky: '#a9c6dd',
  Black: '#1f1e22',
  Heather: '#9b9aa0',
  Charcoal: '#3c3b40',
  Camel: '#c19a6b',
}

export function ProductsCatalog() {
  const products = useDirectoryStore((s) => s.products)
  const addProduct = useDirectoryStore((s) => s.addProduct)
  const toggleProduct = useDirectoryStore((s) => s.toggleProduct)
  const removeProduct = useDirectoryStore((s) => s.removeProduct)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all')

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active).length
    const units = products.reduce((a, p) => a + p.inStock, 0)
    const avgMargin = products.length
      ? products.reduce((a, p) => a + (p.wholesalePrice - p.cost) / p.wholesalePrice, 0) / products.length
      : 0
    const catalogValue = products.reduce((a, p) => a + p.inStock * p.cost, 0)
    return { active, units, avgMargin, catalogValue }
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesTab =
        tab === 'all' || (tab === 'active' ? p.active : !p.active)
      const q = query.toLowerCase()
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [products, tab, query])

  function save() {
    addProduct({
      ...draft,
      sizes: draft.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: draft.colors.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setDraft(emptyDraft)
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products & Catalog"
        description="The finished-goods line sheet — styles, fabrics, wholesale pricing and live stock."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add product
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Active Styles" value={formatNumber(stats.active)} icon={Shirt} accent="primary" hint="in the line sheet" />
        <StatCard label="Units in Stock" value={formatNumber(stats.units)} icon={Boxes} accent="success" hint="across catalog" />
        <StatCard label="Avg Margin" value={`${Math.round(stats.avgMargin * 100)}%`} icon={TrendingUp} accent="accent" hint="wholesale vs cost" />
        <StatCard label="Catalog Value" value={formatCurrency(stats.catalogValue)} icon={Layers} accent="destructive" hint="stock at cost" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles, SKUs…" className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => {
          const margin = Math.round(((p.wholesalePrice - p.cost) / p.wholesalePrice) * 100)
          return (
            <Card key={p.id} className="group gap-0 overflow-hidden p-0">
              <div className="relative flex h-28 items-center justify-center overflow-hidden border-b bg-gradient-to-br from-secondary to-muted">
                <div className="card-grain absolute inset-0 opacity-50" />
                <Shirt className="size-10 text-primary/30" strokeWidth={1.5} />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <RowActions
                    onDelete={() => removeProduct(p.id)}
                    deleteLabel={p.name}
                    extra={null}
                  />
                </div>
                <Badge
                  variant={p.active ? 'success' : 'secondary'}
                  className="absolute left-2 top-2"
                >
                  {p.active ? 'Active' : 'Archived'}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="font-mono text-[0.68rem] text-muted-foreground">{p.sku}</p>
                  <h3 className="font-display text-base font-semibold leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.fabric}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.colors.map((c) => (
                    <span
                      key={c}
                      title={c}
                      className="size-4 rounded-full border border-border/60"
                      style={{ background: swatch[c] ?? '#999' }}
                    />
                  ))}
                  <span className="ml-1 flex flex-wrap gap-1">
                    {p.sizes.slice(0, 5).map((s) => (
                      <span key={s} className="rounded bg-secondary px-1 text-[0.6rem] font-medium text-muted-foreground">{s}</span>
                    ))}
                  </span>
                </div>

                <div className="flex items-end justify-between border-t pt-3">
                  <div>
                    <p className="font-display text-lg font-bold tnum">{formatCurrency(p.wholesalePrice, true)}</p>
                    <p className="text-[0.7rem] text-muted-foreground">{margin}% margin</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium tabular-nums">{formatNumber(p.inStock)}</p>
                    <p className="text-[0.7rem] text-muted-foreground">in stock</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <Label className="text-xs text-muted-foreground">Listed for sale</Label>
                  <Switch checked={p.active} onCheckedChange={() => toggleProduct(p.id)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full grid h-40 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No products match your filters.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add product</DialogTitle>
            <DialogDescription>Add a new style to the line sheet.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Product name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Heritage Denim Jacket" />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} className="font-mono" placeholder="GAR-JKT-DNM" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Fabric</Label>
              <Input value={draft.fabric} onChange={(e) => setDraft({ ...draft, fabric: e.target.value })} placeholder="Denim 12oz" />
            </div>
            <div className="space-y-1.5">
              <Label>Sizes (comma)</Label>
              <Input value={draft.sizes} onChange={(e) => setDraft({ ...draft, sizes: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Colors (comma)</Label>
              <Input value={draft.colors} onChange={(e) => setDraft({ ...draft, colors: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Wholesale price</Label>
              <Input type="number" step="0.01" value={draft.wholesalePrice} onChange={(e) => setDraft({ ...draft, wholesalePrice: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit cost</Label>
              <Input type="number" step="0.01" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>In stock</Label>
              <Input type="number" value={draft.inStock} onChange={(e) => setDraft({ ...draft, inStock: +e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name || !draft.sku}>Add product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
