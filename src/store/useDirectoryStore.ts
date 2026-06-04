import { create } from 'zustand'
import type { Supplier, Customer, Product, User } from '@/types'
import { suppliers as supplierSeed } from '@/data/suppliers'
import { customers as customerSeed } from '@/data/customers'
import { products as productSeed } from '@/data/products'
import { users as userSeed } from '@/data/users'
import { makeId } from '@/lib/utils'

interface DirectoryState {
  suppliers: Supplier[]
  customers: Customer[]
  products: Product[]
  users: User[]
  addSupplier: (s: Omit<Supplier, 'id'>) => void
  removeSupplier: (id: string) => void
  addCustomer: (c: Omit<Customer, 'id'>) => void
  removeCustomer: (id: string) => void
  addProduct: (p: Omit<Product, 'id'>) => void
  toggleProduct: (id: string) => void
  removeProduct: (id: string) => void
  addUser: (u: Omit<User, 'id'>) => void
  updateUser: (id: string, patch: Partial<User>) => void
  removeUser: (id: string) => void
}

export const useDirectoryStore = create<DirectoryState>((set) => ({
  suppliers: supplierSeed,
  customers: customerSeed,
  products: productSeed,
  users: userSeed,

  addSupplier: (s) =>
    set((st) => ({ suppliers: [{ ...s, id: makeId('SUP') }, ...st.suppliers] })),
  removeSupplier: (id) =>
    set((st) => ({ suppliers: st.suppliers.filter((s) => s.id !== id) })),

  addCustomer: (c) =>
    set((st) => ({ customers: [{ ...c, id: makeId('CUS') }, ...st.customers] })),
  removeCustomer: (id) =>
    set((st) => ({ customers: st.customers.filter((c) => c.id !== id) })),

  addProduct: (p) =>
    set((st) => ({ products: [{ ...p, id: makeId('PRD') }, ...st.products] })),
  toggleProduct: (id) =>
    set((st) => ({
      products: st.products.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p,
      ),
    })),
  removeProduct: (id) =>
    set((st) => ({ products: st.products.filter((p) => p.id !== id) })),

  addUser: (u) =>
    set((st) => ({ users: [{ ...u, id: makeId('USR') }, ...st.users] })),
  updateUser: (id, patch) =>
    set((st) => ({
      users: st.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),
  removeUser: (id) =>
    set((st) => ({ users: st.users.filter((u) => u.id !== id) })),
}))
