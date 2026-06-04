import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from './ConfirmDialog'

interface RowActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  deleteLabel?: string
  extra?: React.ReactNode
}

export function RowActions({
  onEdit,
  onDelete,
  deleteLabel = 'this record',
  extra,
}: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
          )}
          {extra}
          {onDelete && (
            <>
              {(onEdit || extra) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirm deletion"
          description={`This will permanently remove ${deleteLabel}. This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={onDelete}
        />
      )}
    </>
  )
}
