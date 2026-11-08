import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react'
import Logo from '../layout/Logo'
import { apiConfig, isMockMode } from '../../services/api'
import { cn } from '../../utils/cn'

// TODO-DESIGN: sidebar shell is assembled from the reference admin pages
// (dashboard_admin_detail_aksi_status_pesanan + kelola_pesanan), which only
// show the sidebar slate; this component turns it into a reusable layout.
const primaryNav = [
  { label: 'Kelola Pesanan', to: '/admin/pesanan', icon: ReceiptText, active: true },
]

// TODO-DESIGN: extra menu entries keep the reference sidebar rhythm even though
// the scope of this build only covers order management.
const secondaryNav = [
  { label: 'Validasi Desain', icon: ShieldCheck },
  { label: 'Katalog Produk', icon: BookOpen },
  { label: 'Bahan & Stok', icon: PackageSearch },
]

function AdminNavItem({ item, onNavigate }) {
  const Icon = item.icon
  if (item.active) {
    return (
      <NavLink
        to={item.to}
        onClick={onNavigate}
        aria-current="page"
        className="flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 font-label-lg text-label-lg text-on-primary shadow-hard-sm transition-all hover:-translate-y-px"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5" aria-hidden="true" />
          {item.label}
        </span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" aria-hidden="true" />
      </NavLink>
    )
  }

  return (
    <span
      aria-disabled="true"
      className="flex cursor-not-allowed items-center justify-between rounded-xl px-4 py-2.5 font-label-lg text-label-lg text-on-surface-variant/55"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {item.label}
      </span>
      <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-caps text-[9px] uppercase tracking-wider text-outline">
        Segera
      </span>
    </span>
  )
}

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5">
        <Logo />
        <div className="mt-4 flex items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5">
          <span className="font-label-caps text-[10px] uppercase tracking-wider text-outline">Mode data</span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-label-caps text-[10px] uppercase tracking-wider',
              isMockMode ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container',
            )}
            title={apiConfig.baseUrl ? `Terhubung ke ${apiConfig.baseUrl}` : 'Data demo disimpan di localStorage'}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', isMockMode ? 'bg-primary' : 'bg-tertiary')} aria-hidden="true" />
            {isMockMode ? 'Demo lokal' : 'API live'}
          </span>
        </div>
      </div>

      <nav aria-label="Navigasi admin" className="mt-6 flex flex-col gap-1 px-3">
        <p className="px-4 pb-1 font-label-caps text-[10px] uppercase tracking-[0.12em] text-outline">Workspace</p>
        <span className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-label-lg text-label-lg text-on-surface-variant/55">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          Dashboard
        </span>
        {primaryNav.map((item) => (
          <AdminNavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}

        <p className="mt-4 px-4 pb-1 font-label-caps text-[10px] uppercase tracking-[0.12em] text-outline">Produksi</p>
        {secondaryNav.map((item) => (
          <AdminNavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto space-y-3 p-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3.5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" aria-hidden="true" />
            Lihat toko
          </span>
          <ArrowUpRight className="h-4 w-4 text-outline" aria-hidden="true" />
        </Link>

        {/* TODO-DESIGN: profile card mirrors the reference sidebar footer. */}
        <div className="rounded-2xl bg-surface-container-low p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-label-md text-label-md text-on-primary">
              AS
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-tertiary ring-2 ring-surface-container-low" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-label-md text-label-md font-bold leading-tight text-on-surface">Admin Studio</p>
              <p className="flex items-center gap-1 font-body-sm text-[11px] font-bold text-tertiary">
                <span className="h-1.5 w-1.5 rounded-full bg-tertiary" aria-hidden="true" />
                Online
              </p>
            </div>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant"
              title="Sesi admin demo"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Keluar dari sesi admin</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = original
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Lompat ke konten admin
      </a>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-label="Tutup menu admin"
        />
      ) : null}

      <aside
        id="sidebar-admin"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-outline-variant/40 bg-surface-container-lowest transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar admin"
      >
        <button
          type="button"
          onClick={closeMobile}
          className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container lg:hidden"
          aria-label="Tutup menu admin"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <SidebarContent onNavigate={closeMobile} />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-outline-variant/40 bg-surface/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="sidebar-admin"
              aria-label="Buka menu admin"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-label-caps text-[10px] uppercase tracking-wider text-outline">
                Faeyza Printing / Manajemen Penjualan
              </p>
              <p className="truncate font-label-md text-label-md font-bold text-primary">Semua Pesanan Masuk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pesan"
              className="hidden items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary sm:inline-flex"
            >
              Buat pesanan
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <div className="text-right">
              <p className="hidden font-label-md text-label-md font-bold leading-tight text-on-surface sm:block">Admin Studio</p>
              <p className="hidden font-body-sm text-[11px] text-on-surface-variant sm:block">Superadmin Percetakan</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary ring-2 ring-primary-container">
              <span className="font-label-md text-label-md text-on-primary">AS</span>
            </span>
          </div>
        </header>

        <main id="konten-admin" className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
