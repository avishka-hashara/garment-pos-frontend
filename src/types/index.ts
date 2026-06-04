/* ============================================================
   Domain model for the Loomworks Garment POS.
   All ids are human-readable strings (e.g. "MAT-1042").
   ============================================================ */

export type StockKind = 'raw' | 'finished'

export type StockStatus = 'healthy' | 'low' | 'critical' | 'out'

export interface StockItem {
  id: string
  sku: string
  name: string
  kind: StockKind
  category: string
  unit: string // metres, pcs, rolls, kg
  quantity: number
  reorderLevel: number
  unitCost: number
  location: string // bin / shelf
  supplierId?: string
  updatedAt: string // ISO
}

export type WorkOrderStatus =
  | 'planned'
  | 'cutting'
  | 'stitching'
  | 'finishing'
  | 'completed'
  | 'on-hold'

export interface MaterialDraw {
  stockId: string
  name: string
  quantity: number
  unit: string
}

export interface WorkOrder {
  id: string // WO-xxxx
  product: string
  productSku: string
  targetQty: number
  completedQty: number
  status: WorkOrderStatus
  line: string // production line
  supervisor: string
  materials: MaterialDraw[]
  releasedAt: string // ISO — when materials left main stock
  dueAt: string // ISO
}

export type SaleStatus = 'paid' | 'partial' | 'unpaid' | 'returned'

export interface SaleLine {
  productSku: string
  product: string
  qty: number
  unitPrice: number
}

export interface Sale {
  id: string // INV-xxxx
  customerId: string
  customer: string
  date: string // ISO
  lines: SaleLine[]
  subtotal: number
  discount: number
  tax: number
  total: number
  amountPaid: number
  status: SaleStatus
  channel: 'wholesale' | 'store'
}

export type ExpenseCategory =
  | 'Payroll'
  | 'Rent'
  | 'Utilities'
  | 'Machinery'
  | 'Logistics'
  | 'Raw Materials'
  | 'Marketing'
  | 'Misc'

export interface Expense {
  id: string // EXP-xxxx
  date: string // ISO
  category: ExpenseCategory
  vendor: string
  description: string
  amount: number
  method: 'cash' | 'bank' | 'card'
  status: 'paid' | 'pending'
}

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  materials: string[]
  leadTimeDays: number
  rating: number // 1-5
  outstanding: number
}

export interface Customer {
  id: string
  name: string
  type: 'Boutique' | 'Department Store' | 'Online' | 'Distributor'
  contact: string
  phone: string
  city: string
  creditLimit: number
  balance: number
  ytdSales: number
}

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  fabric: string
  sizes: string[]
  colors: string[]
  wholesalePrice: number
  cost: number
  inStock: number
  active: boolean
}

export type UserRole = 'Owner' | 'Manager' | 'Floor Lead' | 'Cashier' | 'Viewer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'invited' | 'suspended'
  lastActive: string // ISO
}

export interface SalesPoint {
  label: string // week / month label
  wholesale: number
  store: number
  units: number
}
