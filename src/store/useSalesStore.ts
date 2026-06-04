import { create } from 'zustand'
import type { Sale } from '@/types'
import { sales as seed } from '@/data/sales'
import { makeId } from '@/lib/utils'

interface SalesState {
  sales: Sale[]
  add: (sale: Omit<Sale, 'id'>) => void
  update: (id: string, patch: Partial<Sale>) => void
  remove: (id: string) => void
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: seed,
  add: (sale) =>
    set((s) => ({ sales: [{ ...sale, id: makeId('INV') }, ...s.sales] })),
  update: (id, patch) =>
    set((s) => ({
      sales: s.sales.map((sale) =>
        sale.id === id ? { ...sale, ...patch } : sale,
      ),
    })),
  remove: (id) =>
    set((s) => ({ sales: s.sales.filter((sale) => sale.id !== id) })),
}))
