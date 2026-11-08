import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock3, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { site } from '../../data/site'

const productLinks = [
  { label: 'Kartu Nama', to: '/katalog?kategori=kartu-nama' },
  { label: 'Brosur & Flyer', to: '/katalog?kategori=brosur' },
  { label: 'Banner & Spanduk', to: '/katalog?kategori=banner' },
  { label: 'Kemasan', to: '/katalog?kategori=kemasan' },
  { label: 'Merchandise', to: '/katalog?kategori=merchandise' },
]

const helpLinks = [
  { label: 'Katalog Produk', to: '/katalog' },
  { label: 'Cara Pesan', to: '/#cara-pesan' },
  { label: 'Admin Pesanan', to: '/admin/pesanan' },
  { label: 'Buat Pesanan', to: '/pesan' },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/40 bg-surface-container-low">
      <div className="mx-auto grid w-full max-w-studio gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-margin">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-4 max-w-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">
            Studio percetakan online yang menggabungkan presisi prepress dengan kehangatan bahan kertas terkurasi. Setiap
            lembar diperiksa sebelum naik cetak.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Instagram Faeyza"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={site.phoneHref}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Telepon studio"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Email studio"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-outline">Produk populer</h2>
          <ul className="mt-4 space-y-2.5">
            {productLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-outline">Bantuan</h2>
          <ul className="mt-4 space-y-2.5">
            {helpLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-outline">Kunjungi studio</h2>
          <ul className="mt-4 space-y-3 font-body-md text-body-md text-on-surface-variant">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{site.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{site.hours}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={site.phoneHref} className="hover:text-primary">
                {site.phone}
              </a>
            </li>
          </ul>
          <Link
            to="/pesan"
            className="mt-5 inline-flex items-center gap-1.5 font-label-lg text-label-lg text-primary underline decoration-primary/30 decoration-2 underline-offset-4 hover:decoration-primary"
          >
            Mulai pesanan baru
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="border-t border-outline-variant/30">
        <div className="mx-auto flex w-full max-w-studio flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-margin">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} {site.fullName}. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 font-label-md text-label-md text-on-surface-variant">
            <span>Dibuat dengan presisi di Bandung</span>
            <span aria-hidden="true" className="text-outline-variant">
              ✿
            </span>
            <Link to="/admin/pesanan" className="transition-colors hover:text-primary">
              Panel Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
