import { create } from 'zustand'
import type { Expense } from '@/types'
import { expenses as seed } from '@/data/expenses'
import { makeId } from '@/lib/utils'

interface ExpenseState {
  expenses: Expense[]
  add: (expense: Omit<Expense, 'id'>) => void
  update: (id: string, patch: Partial<Expense>) => void
  remove: (id: string) => void
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: seed,
  add: (expense) =>
    set((s) => ({
      expenses: [{ ...expense, id: makeId('EXP') }, ...s.expenses],
    })),
  update: (id, patch) =>
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  remove: (id) =>
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
}))
