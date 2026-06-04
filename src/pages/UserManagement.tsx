import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Users, ShieldCheck, UserPlus, UserX } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { RowActions } from '@/components/shared/RowActions'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import type { User, UserRole } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'

const ROLES: UserRole[] = ['Owner', 'Manager', 'Floor Lead', 'Cashier', 'Viewer']

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

type Draft = Omit<User, 'id' | 'lastActive'>

const emptyDraft: Draft = {
  name: '',
  email: '',
  role: 'Viewer',
  status: 'invited',
}

export function UserManagement() {
  const users = useDirectoryStore((s) => s.users)
  const addUser = useDirectoryStore((s) => s.addUser)
  const updateUser = useDirectoryStore((s) => s.updateUser)
  const removeUser = useDirectoryStore((s) => s.removeUser)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.status === 'active').length
    const invited = users.filter((u) => u.status === 'invited').length
    const admins = users.filter((u) => u.role === 'Owner' || u.role === 'Manager').length
    return { total, active, invited, admins }
  }, [users])

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft)
    setOpen(true)
  }
  function openEdit(u: User) {
    setEditing(u)
    const { id: _id, lastActive: _l, ...rest } = u
    void _id
    void _l
    setDraft(rest)
    setOpen(true)
  }
  function save() {
    if (editing) updateUser(editing.id, draft)
    else addUser({ ...draft, lastActive: new Date().toISOString() })
    setOpen(false)
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Member',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-[0.72rem] text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => {
          const r = getValue<UserRole>()
          return (
            <Badge variant={r === 'Owner' ? 'default' : r === 'Manager' ? 'accent' : 'outline'}>
              {r}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatDate(getValue<string>(), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
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
            onDelete={() => removeUser(row.original.id)}
            deleteLabel={row.original.name}
          />
        ),
      },
    ],
    [removeUser],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Control"
        title="User Management"
        description="Team members, roles and access across the floor and office."
        actions={
          <Button onClick={openCreate}>
            <Plus /> Invite member
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Team Members" value={formatNumber(stats.total)} icon={Users} accent="primary" hint="total accounts" />
        <StatCard label="Active" value={formatNumber(stats.active)} icon={ShieldCheck} accent="success" hint="signed in recently" />
        <StatCard label="Pending Invites" value={formatNumber(stats.invited)} icon={UserPlus} accent="accent" hint="not yet joined" />
        <StatCard label="Admins" value={formatNumber(stats.admins)} icon={UserX} accent="destructive" hint="elevated access" />
      </div>

      <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Search team…" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit member' : 'Invite member'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update role and access.' : 'Send an invite to a new team member.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Full name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as User['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name || !draft.email}>
              {editing ? 'Save changes' : 'Send invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
