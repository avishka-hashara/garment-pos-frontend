import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { navSections } from './nav-config'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/lib/utils'

function NavList() {
  const setMobileOpen = useUiStore((s) => s.setMobileOpen)
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5 scrollbar-thin">
      {navSections.map((section) => (
        <div key={section.heading} className="space-y-1">
          <p className="px-3 pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
            {section.heading}
          </p>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary transition-all',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <item.icon className="size-[1.05rem] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-1">
      <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" opacity="0.35" />
          <path d="M6 3v18M12 3v18M18 3v18" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="font-display text-[1.05rem] font-bold tracking-tight text-sidebar-foreground">
          Loomworks
        </p>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-sidebar-foreground/45">
          Garment POS
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <div className="border-t border-sidebar-border px-5 py-4">
      <p className="text-[0.65rem] text-sidebar-foreground/40">
        Eastgate Mill · Unit 04
      </p>
      <p className="mt-0.5 text-[0.65rem] text-sidebar-foreground/40">
        v1.0 · {new Date().getFullYear()}
      </p>
    </div>
  )
}

export function Sidebar() {
  const mobileOpen = useUiStore((s) => s.mobileOpen)
  const setMobileOpen = useUiStore((s) => s.setMobileOpen)

  return (
    <>
      {/* desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <Footer />
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              className="absolute right-3 top-5 rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent/60 cursor-pointer"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" />
            </button>
            <Brand />
            <NavList />
            <Footer />
          </aside>
        </div>
      )}
    </>
  )
}
