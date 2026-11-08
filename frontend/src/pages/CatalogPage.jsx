import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Flower2, PackageSearch, Search, SlidersHorizontal, Sparkles, UploadCloud, X } from 'lucide-react'
import { CategoryNav } from '../components/katalog/CategoryNav'
import { ProductCard, ProductCardSkeleton } from '../components/katalog/ProductCard'
import { SortSelect } from '../components/katalog/SortSelect'
import { Alert } from '../components/ui/Alert'
import { Button, buttonStyles } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { categories, formatPriceFrom } from '../data/products'
import { orderSteps, trustBadges } from '../data/site'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts } from '../hooks/useProducts'
import { formatNumber } from '../utils/format'

const sorters = {
  populer: null,
  'harga-rendah': (a, b) => a.priceFrom - b.priceFrom,
  'harga-tinggi': (a, b) => b.priceFrom - a.priceFrom,
  nama: (a, b) => a.name.localeCompare(b.name, 'id'),
  'min-order': (a, b) => a.minOrder - b.minOrder,
}

const stepIcons = [SlidersHorizontal, UploadCloud, BadgeCheck]

export function CatalogPage() {
  usePageTitle('Katalog Produk')
  const { products, loading, error, retry } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()

  const category = categories.some((item) => item.id === searchParams.get('kategori'))
    ? searchParams.get('kategori')
    : 'semua'
  const query = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'populer'

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'semua' || (key === 'sort' && value === 'populer')) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const clearSearch = () => updateParam('q', '')
  const resetFilters = () => setSearchParams({}, { replace: true })

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    let list = products.filter((product) => category === 'semua' || product.categoryId === category)

    if (needle) {
      list = list.filter((product) => {
        const haystack = [
          product.name,
          product.category,
          product.shortDescription,
          ...product.tags,
          ...product.materials.map((material) => material.label),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(needle)
      })
    }

    const sorter = sorters[sort]
    return sorter ? [...list].sort(sorter) : list
  }, [products, category, query, sort])

  const activeCategory = categories.find((item) => item.id === category) ?? categories[0]

  return (
    <div className="pb-4">
      <section className="mx-auto w-full max-w-studio px-4 pt-8 sm:px-6 lg:px-margin lg:pt-10">
        <div className="paper-grain relative overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-low px-5 py-8 shadow-card sm:px-8 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-container/50 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-secondary-container/40 blur-2xl" aria-hidden="true" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-on-surface bg-primary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-primary-container shadow-hard-sm">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Studio Catalog
                </span>
                <span className="font-body-sm text-body-sm font-semibold text-tertiary">Koleksi cetak 2026</span>
              </div>
              <h1 className="mt-3 font-display-mobile text-display-mobile tracking-tight text-on-surface sm:font-display sm:text-display">
                Produk cetak, <span className="text-primary">dibuat presisi.</span>
              </h1>
              <p className="mt-3 max-w-xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                Pilih kategori, bandingkan bahan premium, dan atur spesifikasi cetakmu. Harga muncul transparan sejak
                awal, tanpa biaya tersembunyi.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm">
                  <Flower2 className="h-3.5 w-3.5 text-tertiary" aria-hidden="true" />
                  {loading ? '…' : `${formatNumber(products.length)} produk`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {categories.length - 1} kategori
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm">
                  <BadgeCheck className="h-3.5 w-3.5 text-tertiary" aria-hidden="true" />
                  Prepress check 1×24 jam
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-2.5 shadow-lift">
                <div className="relative">
                  <label htmlFor="cari-katalog" className="sr-only">
                    Cari nama produk atau bahan
                  </label>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
                  <input
                    id="cari-katalog"
                    type="search"
                    value={query}
                    onChange={(event) => updateParam('q', event.target.value)}
                    placeholder="Cari nama produk / bahan…"
                    className="field-base border-transparent bg-surface-container py-3 pl-10 pr-10 focus:border-primary focus:bg-surface-container-lowest"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
                      aria-label="Hapus pencarian"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-surface-container px-2 py-2">
                  <div>
                    <p className="font-label-caps text-[10px] uppercase tracking-wider text-outline">Total katalog</p>
                    <p className="font-label-lg text-label-lg font-bold text-primary">
                      {loading ? 'Memuat…' : `${formatNumber(products.length)} item siap cetak`}
                    </p>
                  </div>
                  <Link
                    to="/pesan"
                    className={buttonStyles({ variant: 'primary', size: 'sm', className: 'shrink-0' })}
                  >
                    Pesan
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <p className="mt-2 px-1 font-body-sm text-[11px] text-on-surface-variant">
                Contoh: kartu nama, linen, spanduk, stiker vinyl.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-studio px-4 pt-7 sm:px-6 lg:px-margin" aria-labelledby="judul-katalog">
        <h2 id="judul-katalog" className="sr-only">
          Katalog produk percetakan
        </h2>

        <CategoryNav categories={categories} active={category} onChange={(id) => updateParam('kategori', id)} />

        <div className="mt-4 flex flex-col gap-3 border-b border-outline-variant/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body-md text-body-md text-on-surface-variant" aria-live="polite">
            Menampilkan <span className="font-bold text-on-surface">{formatNumber(filtered.length)}</span> produk
            {category !== 'semua' ? (
              <>
                {' '}
                di <span className="font-bold text-on-surface">{activeCategory.label}</span>
              </>
            ) : null}
            {query.trim() ? (
              <>
                {' '}
                untuk <span className="font-bold text-on-surface">“{query.trim()}”</span>
              </>
            ) : null}
          </p>
          <SortSelect value={sort} onChange={(value) => updateParam('sort', value)} />
        </div>

        {error ? (
          <Alert
            tone="error"
            title="Katalog gagal dimuat"
            className="mt-5"
            action={
              <Button variant="outline" size="sm" onClick={retry}>
                Coba lagi
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat katalog produk">
              {Array.from({ length: 6 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="Produk tidak ditemukan"
              description={
                query.trim()
                  ? `Belum ada produk yang cocok dengan “${query.trim()}” di kategori ini. Coba kata kunci lain atau reset filter.`
                  : 'Kategori ini belum memiliki produk. Tampilkan semua produk untuk melihat katalog lengkap.'
              }
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Tampilkan semua produk
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* TODO-DESIGN: "Cara Pesan" section is composed for this build from the
          reference order-step content; the catalog reference page ends at the grid. */}
      <section id="cara-pesan" className="mx-auto w-full max-w-studio scroll-mt-28 px-4 pt-14 sm:px-6 lg:px-margin">
        <div className="grid gap-6 rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-card sm:p-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-secondary-container">
              <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
              Cara pesan
            </span>
            <h2 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
              Tiga langkah, berkas siap cetak.
            </h2>
            <p className="mt-2 font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Tim prepress memeriksa resolusi, bleed, dan profil warna sebelum pesanan masuk antrean mesin cetak.
            </p>
            <Link to="/pesan" className={buttonStyles({ variant: 'primary', size: 'md', className: 'mt-4' })}>
              Mulai pesanan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="grid gap-3 sm:grid-cols-3 lg:col-span-8">
            {orderSteps.map((step, index) => {
              const Icon = stepIcons[index] ?? Sparkles
              return (
                <li
                  key={step.title}
                  className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold text-outline-variant">0{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-label-lg font-bold text-on-surface">{step.title}</h3>
                    <p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3.5 py-3"
            >
              <BadgeCheck className="h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
              <p className="font-label-md text-label-md text-on-surface">
                {badge.label} <span className="font-body-sm font-normal text-on-surface-variant">· {badge.detail}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TODO-DESIGN: closing CTA banner is a new composition using the reference palette. */}
      <section className="mx-auto w-full max-w-studio px-4 pt-10 sm:px-6 lg:px-margin">
        <div className="relative overflow-hidden rounded-3xl border border-on-surface bg-primary px-6 py-8 text-on-primary shadow-hard-navy sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-container/30 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-secondary-container/20 blur-2xl" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container">Siap naik cetak?</p>
              <h2 className="mt-1.5 font-headline-lg-mobile text-headline-lg-mobile tracking-tight sm:font-headline-lg sm:text-headline-lg">
                Cetak sesuatu yang layak diingat.
              </h2>
              <p className="mt-2 font-body-md text-body-md leading-relaxed text-primary-fixed/85">
                Mulai dari {formatPriceFrom({ priceFrom: 650 })}. Unggah desainmu, kami urus prepress sampai finishing.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/pesan"
                className="inline-flex items-center gap-2 rounded-xl border border-on-surface bg-primary-container px-5 py-3 font-label-lg text-label-lg text-on-primary-container shadow-hard transition-all hover:-translate-y-px"
              >
                Pesan sekarang
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#judul-katalog"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-container/40 bg-primary/40 px-5 py-3 font-label-lg text-label-lg text-primary-container transition-colors hover:bg-primary/60"
              >
                Jelajahi katalog
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CatalogPage
