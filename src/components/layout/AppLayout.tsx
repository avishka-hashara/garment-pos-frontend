import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLDivElement>(null)

  // reset scroll on route change
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
