import {
  LayoutDashboard,
  Boxes,
  Factory,
  ShoppingCart,
  Receipt,
  Truck,
  Store,
  Shirt,
  FileBarChart,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export interface NavSection {
  heading: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    heading: 'Operations',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
      { label: 'Main Stock', to: '/stock', icon: Boxes },
      { label: 'Production Released', to: '/production', icon: Factory },
      { label: 'Sales & Wholesale', to: '/sales', icon: ShoppingCart },
      { label: 'Expenses', to: '/expenses', icon: Receipt },
    ],
  },
  {
    heading: 'Directory',
    items: [
      { label: 'Suppliers', to: '/suppliers', icon: Truck },
      { label: 'Customers / Stores', to: '/customers', icon: Store },
      { label: 'Products / Catalog', to: '/products', icon: Shirt },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Reports', to: '/reports', icon: FileBarChart },
      { label: 'User Management', to: '/users', icon: Users },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]
