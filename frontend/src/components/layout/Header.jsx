import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { navLinks, site } from '../../data/site'
import { buttonStyles } from '../ui/Button'
import { cn } from '../../utils/cn'

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!open) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const isActive = (to) => {
    if (to === '/katalog') return location.pathname === '/' || location.pathname.startsWith('/produk')
    if (to === '/admin/pesanan') return location.pathname.startsWith('/admin')
    return false
  }

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/40 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-studio items-center justify-between gap-4 px-4 sm:px-6 lg:px-margin">
        <Logo />

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                'rounded-lg px-3.5 py-2 font-label-lg text-label-lg transition-colors',
                isActive(link.to)
                  ? 'bg-primary-container/70 text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="hidden rounded-lg px-2 py-1 text-right xl:block"
            aria-label={`Hubungi studio di ${site.phone}`}
          >
            <span className="block font-label-caps text-[10px] uppercase tracking-wider text-outline">Konsultasi cetak</span>
            <span className="block font-label-md text-label-md text-on-surface">{site.phone}</span>
          </a>
          <Link to="/pesan" className={buttonStyles({ variant: 'primary', size: 'md', className: 'hidden sm:inline-flex' })}>
            Pesan Sekarang
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="border-t border-outline-variant/40 bg-surface-container-lowest px-4 pb-5 pt-3 shadow-lift lg:hidden">
          <nav aria-label="Navigasi mobile" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'rounded-xl px-4 py-3 font-label-lg text-label-lg transition-colors',
                  isActive(link.to)
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/pesan" className={buttonStyles({ variant: 'primary', size: 'md', className: 'mt-2 w-full' })}>
              Pesan Sekarang
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href={site.phoneHref} className="mt-1 rounded-xl px-4 py-3 text-center font-body-sm text-body-sm text-on-surface-variant">
              Konsultasi: {site.phone}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export default Header
