import { create } from 'zustand'
import type { WorkOrder } from '@/types'
import { workOrders as seed } from '@/data/workOrders'
import { makeId } from '@/lib/utils'

interface ProductionState {
  orders: WorkOrder[]
  add: (order: Omit<WorkOrder, 'id'>) => void
  update: (id: string, patch: Partial<WorkOrder>) => void
  remove: (id: string) => void
}

export const useProductionStore = create<ProductionState>((set) => ({
  orders: seed,
  add: (order) =>
    set((s) => ({ orders: [{ ...order, id: makeId('WO') }, ...s.orders] })),
  update: (id, patch) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  remove: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
}))
