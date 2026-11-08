import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Compass, Flower2, Search } from 'lucide-react'
import { buttonStyles } from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Halaman tidak ditemukan')

  return (
    <div className="mx-auto w-full max-w-studio px-4 py-10 sm:px-6 sm:py-14 lg:px-margin">
      <div className="paper-grain relative overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-low px-5 py-12 text-center shadow-card sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-primary-container/50 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-secondary-container/50 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-on-surface bg-primary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-primary-container shadow-hard-sm">
            <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
            Error 404
          </span>

          <p className="mt-8 font-display text-[5rem] leading-none tracking-tight text-primary sm:text-[7rem]" aria-hidden="true">
            404
          </p>
          <h1 className="mt-2 font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
            Halaman ini belum tercetak.
          </h1>
          <p className="mt-3 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            Tautan yang kamu buka tidak ditemukan. Mungkin halaman sudah dipindahkan, atau ada salah ketik pada alamat.
          </p>

          <div className="mt-6 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Link to="/katalog" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
              <Compass className="h-4 w-4" aria-hidden="true" />
              Jelajahi katalog
            </Link>
            <Link to="/" className={buttonStyles({ variant: 'outline', size: 'lg' })}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke beranda
            </Link>
          </div>

          <div className="mt-10 flex w-full flex-col items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-left sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                <Search className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-label-lg text-label-lg font-bold text-on-surface">Mencari produk tertentu?</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Telusuri 14 produk cetak dengan pencarian dan filter kategori.
                </p>
              </div>
            </div>
            <Link to="/katalog" className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'shrink-0' })}>
              Cari produk
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-6 font-body-sm text-body-sm text-on-surface-variant">
            Atau langsung{' '}
            <Link to="/pesan" className="font-bold text-primary underline decoration-primary/30 decoration-2 underline-offset-4 hover:decoration-primary">
              buat pesanan baru
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
