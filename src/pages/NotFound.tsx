import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-3">
        <p className="font-display text-7xl font-bold text-primary/20">404</p>
        <h1 className="text-xl font-semibold">This aisle is empty</h1>
        <p className="text-sm text-muted-foreground">
          The page you’re looking for isn’t on the floor.
        </p>
        <Button asChild className="mt-2">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
