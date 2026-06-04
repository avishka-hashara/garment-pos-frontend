import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUiStore } from '@/store/useUiStore'
import { navSections } from './nav-config'

function useCrumb() {
  const { pathname } = useLocation()
  for (const section of navSections) {
    const match = section.items.find((i) =>
      i.end ? i.to === pathname : pathname.startsWith(i.to) && i.to !== '/',
    )
    if (match) return { section: section.heading, page: match.label }
  }
  if (pathname === '/') return { section: 'Operations', page: 'Dashboard' }
  return { section: 'Loomworks', page: '' }
}

export function Topbar() {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const setMobileOpen = useUiStore((s) => s.setMobileOpen)
  const crumb = useCrumb()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {crumb.section}
        </span>
        <span className="font-display text-sm font-semibold">{crumb.page}</span>
      </div>

      <div className="relative ml-auto hidden w-full max-w-xs md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders, SKUs, customers…"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="size-[1.1rem]" />
          ) : (
            <Sun className="size-[1.1rem]" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-[1.1rem]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 cursor-pointer">
              <Avatar>
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Avishka Perera
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Owner · Loomworks
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
