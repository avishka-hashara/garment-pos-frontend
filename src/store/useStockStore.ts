import { create } from 'zustand'
import type { StockItem, StockStatus } from '@/types'
import { stockItems as seed } from '@/data/stock'
import { makeId } from '@/lib/utils'

export function stockStatus(item: StockItem): StockStatus {
  if (item.quantity <= 0) return 'out'
  if (item.quantity <= item.reorderLevel * 0.5) return 'critical'
  if (item.quantity <= item.reorderLevel) return 'low'
  return 'healthy'
}

interface StockState {
  items: StockItem[]
  add: (item: Omit<StockItem, 'id' | 'updatedAt'>) => void
  update: (id: string, patch: Partial<StockItem>) => void
  remove: (id: string) => void
}

export const useStockStore = create<StockState>((set) => ({
  items: seed,
  add: (item) =>
    set((s) => ({
      items: [
        {
          ...item,
          id: makeId('MAT'),
          updatedAt: new Date().toISOString(),
        },
        ...s.items,
      ],
    })),
  update: (id, patch) =>
    set((s) => ({
      items: s.items.map((it) =>
        it.id === id
          ? { ...it, ...patch, updatedAt: new Date().toISOString() }
          : it,
      ),
    })),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
}))
