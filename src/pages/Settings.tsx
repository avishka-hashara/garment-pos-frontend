import { useState } from 'react'
import { Moon, Sun, Building2, Bell, Palette, Database, Check } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/lib/utils'

function SettingRow({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  )
}

export function Settings() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const [toggles, setToggles] = useState({
    lowStock: true,
    dueOrders: true,
    weeklyDigest: false,
    autoReorder: false,
    compactTables: false,
  })
  const [saved, setSaved] = useState(false)

  function set<K extends keyof typeof toggles>(key: K, val: boolean) {
    setToggles((t) => ({ ...t, [key]: val }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Business profile, appearance, notifications and data preferences."
        actions={
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800) }}>
            {saved ? <><Check /> Saved</> : 'Save changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* business profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </span>
              <div>
                <CardTitle className="text-base">Business Profile</CardTitle>
                <CardDescription>Appears on invoices and reports.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Company name</Label>
              <Input defaultValue="Loomworks Garment Co." />
            </div>
            <div className="space-y-1.5">
              <Label>Tax ID</Label>
              <Input defaultValue="GB-4471-9920" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Base currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD — US Dollar</SelectItem>
                  <SelectItem value="eur">EUR — Euro</SelectItem>
                  <SelectItem value="gbp">GBP — Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Factory address</Label>
              <Input defaultValue="Eastgate Industrial Park, Unit 04" />
            </div>
            <div className="space-y-1.5">
              <Label>Default tax rate (%)</Label>
              <Input type="number" defaultValue={8} />
            </div>
            <div className="space-y-1.5">
              <Label>Fiscal year start</Label>
              <Select defaultValue="jan">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan">January</SelectItem>
                  <SelectItem value="apr">April</SelectItem>
                  <SelectItem value="jul">July</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-accent/15 text-accent-foreground">
                <Palette className="size-4" />
              </span>
              <div>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>Theme & density.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-all cursor-pointer',
                    theme === t
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:bg-secondary/50',
                  )}
                >
                  {t === 'light' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
            <Separator />
            <SettingRow title="Compact tables" desc="Tighter row spacing in grids.">
              <Switch checked={toggles.compactTables} onCheckedChange={(v) => set('compactTables', v)} />
            </SettingRow>
          </CardContent>
        </Card>

        {/* notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-warning/15 text-[color-mix(in_oklch,var(--warning)_65%,black)]">
                <Bell className="size-4" />
              </span>
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>When the system should alert you.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            <SettingRow title="Low-stock alerts" desc="Notify when any item hits its reorder level.">
              <Switch checked={toggles.lowStock} onCheckedChange={(v) => set('lowStock', v)} />
            </SettingRow>
            <SettingRow title="Due work orders" desc="Remind me of batches nearing their due date.">
              <Switch checked={toggles.dueOrders} onCheckedChange={(v) => set('dueOrders', v)} />
            </SettingRow>
            <SettingRow title="Weekly digest" desc="Email a Monday summary of sales & production.">
              <Switch checked={toggles.weeklyDigest} onCheckedChange={(v) => set('weeklyDigest', v)} />
            </SettingRow>
          </CardContent>
        </Card>

        {/* data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-success/15 text-[var(--success)]">
                <Database className="size-4" />
              </span>
              <div>
                <CardTitle className="text-base">Data</CardTitle>
                <CardDescription>Automation & export.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow title="Auto-reorder" desc="Draft POs at reorder level.">
              <Switch checked={toggles.autoReorder} onCheckedChange={(v) => set('autoReorder', v)} />
            </SettingRow>
            <Separator />
            <div className="pt-3">
              <Button variant="outline" className="w-full">Export all data (CSV)</Button>
              <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
                Mock environment · data resets on reload
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
