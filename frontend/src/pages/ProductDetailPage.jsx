import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Flower2,
  Layers3,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Breadcrumbs } from '../components/layout/Breadcrumbs'
import { ProductCard } from '../components/katalog/ProductCard'
import { ProductGallery } from '../components/katalog/ProductGallery'
import { QuantityStepper } from '../components/form/QuantityStepper'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button, buttonStyles } from '../components/ui/Button'
import { ChoiceCard } from '../components/ui/ChoiceCard'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts } from '../hooks/useProducts'
import { calculatePrice } from '../utils/calculatePrice'
import { formatNumber, formatRupiah } from '../utils/format'
import { validateQuantity } from '../utils/validation'

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin" aria-busy="true" aria-label="Memuat detail produk">
      <div className="skeleton h-4 w-64" />
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <div className="skeleton aspect-[4/3] rounded-2xl" />
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-9 w-4/5" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-28 w-full rounded-2xl" />
          <div className="skeleton h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products, loading, error, retry } = useProducts()
  const product = products.find((item) => item.slug === slug) ?? null

  usePageTitle(product?.name ?? 'Detail Produk')

  const [materialId, setMaterialId] = useState('')
  const [sizeId, setSizeId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [quantityError, setQuantityError] = useState('')

  useEffect(() => {
    if (!product) return
    setMaterialId(product.materials[0]?.id ?? '')
    setSizeId(product.sizes[0]?.id ?? '')
    setQuantity(String(product.minOrder))
    setQuantityError('')
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const material = product?.materials.find((item) => item.id === materialId) ?? product?.materials[0] ?? null
  const size = product?.sizes.find((item) => item.id === sizeId) ?? product?.sizes[0] ?? null
  const quantityNumber = Number(quantity) || 0

  const price = useMemo(() => {
    if (!product || !material || !size) return null
    return calculatePrice({
      basePrice: product.basePrice,
      quantity: quantityNumber,
      materialFactor: material.factor,
      sizeFactor: size.factor,
    })
  }, [product, material, size, quantityNumber])

  const related = useMemo(() => {
    if (!product) return []
    const sameCategory = products.filter(
      (item) => item.categoryId === product.categoryId && item.id !== product.id,
    )
    const used = new Set([product.id, ...sameCategory.map((item) => item.id)])
    const fallback = products.filter((item) => !used.has(item.id))
    return [...sameCategory, ...fallback].slice(0, 3)
  }, [products, product])

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin">
        <Breadcrumbs items={[{ label: 'Katalog', to: '/katalog' }]} />
        <Alert
          tone="error"
          title="Detail produk gagal dimuat"
          className="mt-5"
          action={
            <Button variant="outline" size="sm" onClick={retry}>
              Coba lagi
            </Button>
          }
        >
          {error}
        </Alert>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin">
        <Breadcrumbs items={[{ label: 'Katalog', to: '/katalog' }, { label: 'Produk tidak ditemukan' }]} />
        <div className="pt-6">
          <EmptyState
            icon={PackageCheck}
            title="Produk tidak tersedia"
            description="Produk yang kamu cari mungkin sudah diganti atau tautannya tidak lagi berlaku. Jelajahi katalog untuk menemukan produk cetak lain."
            action={
              <Link to="/katalog" className={buttonStyles({ variant: 'primary', size: 'md' })}>
                Kembali ke katalog
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const underMin = quantityNumber < product.minOrder
  const handleQuantityChange = (value) => {
    setQuantity(value)
    if (quantityError) setQuantityError(validateQuantity(value, product.minOrder))
  }

  const handleOrder = () => {
    const message = validateQuantity(quantity, product.minOrder)
    if (message) {
      setQuantityError(message)
      document.getElementById('detail-jumlah')?.focus()
      return
    }

    const params = new URLSearchParams({
      produk: product.slug,
      bahan: material.id,
      ukuran: size.id,
      jumlah: String(price.quantity),
    })
    navigate(`/pesan?${params.toString()}`)
  }

  return (
    <div className="pb-4">
      <section className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin">
        <Breadcrumbs
          items={[
            { label: 'Katalog', to: '/katalog' },
            { label: product.category, to: `/katalog?kategori=${product.categoryId}` },
            { label: product.name },
          ]}
        />
      </section>

      {/* TODO-DESIGN: the split detail layout is composed from the reference
          product detail + catalog card language; the reference set does not
          include a dedicated product page. */}
      <section className="mx-auto w-full max-w-studio px-4 pt-5 sm:px-6 lg:px-margin" aria-labelledby="judul-produk">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} name={product.name} />

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2.5">
                <CalendarClock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Pengerjaan</p>
                  <p className="font-label-md text-label-md text-on-surface">{product.turnaround}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2.5">
                <PackageCheck className="h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Minimal order</p>
                  <p className="font-label-md text-label-md text-on-surface">
                    {formatNumber(product.minOrder)} {product.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Prepress</p>
                  <p className="font-label-md text-label-md text-on-surface">Cek 1×24 jam</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-secondary-container">
                <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                {product.category}
              </span>
              {product.badge ? <Badge tone={product.badgeTone}>{product.badge}</Badge> : null}
            </div>

            <h1
              id="judul-produk"
              className="mt-3 font-display-mobile text-display-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg"
            >
              {product.name}
            </h1>
            <p className="mt-2 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              {product.shortDescription}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-surface-container px-2.5 py-1 font-label-caps text-label-caps text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-sm">
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Harga mulai</p>
                <p className="mt-1 font-headline-sm text-headline-sm font-bold text-on-surface">
                  {formatRupiah(product.priceFrom)}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{product.priceUnit}</p>
              </div>
              <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-sm">
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Kualitas</p>
                <p className="mt-1 font-headline-sm text-headline-sm font-bold text-on-surface">Grade premium</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Bahan terkurasi studio</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Atur spesifikasi</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-2.5 py-1 font-label-caps text-label-caps uppercase text-on-primary-container">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Estimasi live
                </span>
              </div>

              <fieldset className="mt-4 border-0 p-0">
                <legend className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                  <Layers3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Bahan <span className="text-error" aria-hidden="true">*</span>
                </legend>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {product.materials.map((item) => (
                    <ChoiceCard
                      key={item.id}
                      type="radio"
                      name="detail-bahan"
                      value={item.id}
                      checked={material?.id === item.id}
                      onChange={() => setMaterialId(item.id)}
                      title={item.label}
                      description={item.description}
                      meta={`Faktor ×${item.factor}`}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-4 border-0 p-0">
                <legend className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                  <Ruler className="h-4 w-4 text-primary" aria-hidden="true" />
                  Ukuran <span className="text-error" aria-hidden="true">*</span>
                </legend>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {product.sizes.map((item) => (
                    <ChoiceCard
                      key={item.id}
                      type="radio"
                      name="detail-ukuran"
                      value={item.id}
                      checked={size?.id === item.id}
                      onChange={() => setSizeId(item.id)}
                      title={item.label}
                      description={item.description}
                      meta={`Faktor ×${item.factor}`}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                  <PackageCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  Jumlah <span className="text-error" aria-hidden="true">*</span>
                </p>
                <QuantityStepper
                  id="detail-jumlah"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={product.minOrder}
                  unit={product.unit}
                  error={quantityError}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-primary/25 bg-primary-container/20 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-primary-container">
                      Total estimasi
                    </p>
                    <p className="mt-0.5 font-headline-md text-headline-md font-bold tracking-tight text-on-surface" aria-live="polite">
                      {formatRupiah(price?.total ?? 0)}
                    </p>
                    <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                      {formatNumber(quantityNumber)} {product.unit} × {formatRupiah(price?.unitPrice ?? 0)}
                    </p>
                  </div>
                  {price?.discountAmount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider text-on-tertiary-container">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Diskon {price.discountPercent}%
                    </span>
                  ) : null}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-primary/15 pt-3 font-body-sm text-body-sm">
                  <div>
                    <dt className="text-on-surface-variant">Subtotal</dt>
                    <dd className="font-semibold text-on-surface">{formatRupiah(price?.subtotal ?? 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Diskon</dt>
                    <dd className={price?.discountAmount > 0 ? 'font-semibold text-tertiary' : 'text-on-surface-variant'}>
                      {price?.discountAmount > 0 ? `− ${formatRupiah(price.discountAmount)}` : 'Belum berlaku'}
                    </dd>
                  </div>
                </dl>

                <Button
                  variant="primary"
                  size="lg"
                  className="mt-3 w-full"
                  onClick={handleOrder}
                  disabled={underMin}
                  aria-describedby={underMin ? 'detail-min-hint' : undefined}
                >
                  Pesan Sekarang
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <p id="detail-min-hint" className="mt-2 text-center font-body-sm text-body-sm text-on-surface-variant">
                  {underMin
                    ? `Minimal pemesanan ${formatNumber(product.minOrder)} ${product.unit}.`
                    : 'Spesifikasi dan estimasi harga otomatis terbawa ke formulir pesanan.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-studio px-4 pt-12 sm:px-6 lg:px-margin" aria-label="Deskripsi dan spesifikasi">
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <div className="h-full rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-card sm:p-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-secondary-container">
                <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                Tentang produk
              </span>
              <h2 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
                Detail yang membuat hasil cetak terasa mahal.
              </h2>
              <p className="mt-3 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">{product.description}</p>

              <h3 className="mt-6 font-label-lg text-label-lg font-bold text-on-surface">Finishing tersedia</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.finishing.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low px-2.5 py-1.5 font-label-md text-label-md text-on-surface-variant"
                  >
                    <Check className="h-3.5 w-3.5 text-tertiary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-tertiary-container/50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-tertiary" aria-hidden="true" />
                <p className="font-body-md text-body-md leading-relaxed text-on-tertiary-container">
                  Setiap berkas diperiksa manual: resolusi minimal 300 DPI, bleed 3 mm, dan profil warna CMYK. Kami
                  menghubungi kamu bila ada bagian yang perlu diperbaiki sebelum naik cetak.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-card sm:p-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Spesifikasi cetak</h2>
              <dl className="mt-4 divide-y divide-outline-variant/30 border-y border-outline-variant/30">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="font-body-sm text-body-sm text-on-surface-variant">{spec.label}</dt>
                    <dd className="max-w-[60%] text-right font-label-md text-label-md font-semibold text-on-surface">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 rounded-2xl bg-surface-container-low p-3.5">
                <p className="font-label-md text-label-md font-bold text-on-surface">Butuh ukuran atau bahan lain?</p>
                <p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  Tim studio bisa menyesuaikan spesifikasi khusus. Mulai pesanan lalu tulis kebutuhanmu di catatan.
                </p>
                <Link to={`/pesan?produk=${product.slug}`} className={buttonStyles({ variant: 'outline', size: 'sm', className: 'mt-3' })}>
                  Konsultasi spesifikasi
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mx-auto w-full max-w-studio px-4 pt-12 sm:px-6 lg:px-margin" aria-labelledby="produk-serupa">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-primary-container">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Rekomendasi studio
              </span>
              <h2
                id="produk-serupa"
                className="mt-2 font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg"
              >
                Produk serupa
              </h2>
            </div>
            <Link
              to={`/katalog?kategori=${product.categoryId}`}
              className="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-primary underline decoration-primary/30 decoration-2 underline-offset-4 hover:decoration-primary"
            >
              Lihat kategori {product.category}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default ProductDetailPage
