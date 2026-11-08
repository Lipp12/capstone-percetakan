import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { CatalogPage } from './pages/CatalogPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderPage } from './pages/OrderPage'
import { ProductDetailPage } from './pages/ProductDetailPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/pesanan" replace />} />
          <Route path="pesanan" element={<AdminOrdersPage />} />
          <Route path="*" element={<Navigate to="/admin/pesanan" replace />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route index element={<CatalogPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/produk/:slug" element={<ProductDetailPage />} />
          <Route path="/pesan" element={<OrderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
