import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { MainStock } from '@/pages/MainStock'
import { ProductionReleased } from '@/pages/ProductionReleased'
import { Sales } from '@/pages/Sales'
import { Expenses } from '@/pages/Expenses'
import { Suppliers } from '@/pages/Suppliers'
import { Customers } from '@/pages/Customers'
import { ProductsCatalog } from '@/pages/ProductsCatalog'
import { Reports } from '@/pages/Reports'
import { UserManagement } from '@/pages/UserManagement'
import { Settings } from '@/pages/Settings'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<MainStock />} />
        <Route path="production" element={<ProductionReleased />} />
        <Route path="sales" element={<Sales />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<ProductsCatalog />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
