import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Flower2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import { Breadcrumbs } from '../components/layout/Breadcrumbs'
import { FileUpload } from '../components/form/FileUpload'
import { PriceSummary } from '../components/form/PriceSummary'
import { QuantityStepper } from '../components/form/QuantityStepper'
import { Alert } from '../components/ui/Alert'
import { StatusBadge } from '../components/ui/Badge'
import { Button, buttonStyles } from '../components/ui/Button'
import { ChoiceCard } from '../components/ui/ChoiceCard'
import { Input, Select, Textarea } from '../components/ui/Field'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProducts } from '../hooks/useProducts'
import { createOrder, getApiErrorMessage, isMockMode } from '../services/api'
import { calculatePrice } from '../utils/calculatePrice'
import { formatNumber, formatRupiah } from '../utils/format'
import { validateCustomerField, validateFile, validateQuantity } from '../utils/validation'

const emptyCustomer = { name: '', email: '', phone: '', address: '', notes: '' }

const fieldIds = {
  product: 'produk',
  name: 'nama',
  email: 'email',
  phone: 'telepon',
  address: 'alamat',
  quantity: 'jumlah',
}

function FormSection({ step, title, description, icon: Icon, children }) {
  return (
    <section className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-3 border-b border-surface-container pb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container shadow-hard-sm">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-outline">Langkah {step}</p>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
          {description ? (
            <p className="mt-0.5 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function OrderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin" aria-busy="true" aria-label="Memuat formulir pesanan">
      <div className="skeleton h-4 w-56" />
      <div className="skeleton mt-4 h-9 w-2/3" />
      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="skeleton h-56 rounded-3xl" />
          <div className="skeleton h-72 rounded-3xl" />
          <div className="skeleton h-56 rounded-3xl" />
        </div>
        <div className="lg:col-span-5">
          <div className="skeleton h-[28rem] rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

export function OrderPage() {
  usePageTitle('Buat Pesanan')

  const [searchParams] = useSearchParams()
  const { products, loading: productsLoading, error: productsError, retry } = useProducts()

  const [productSlug, setProductSlug] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [sizeId, setSizeId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [customer, setCustomer] = useState(emptyCustomer)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [progress, setProgress] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  const submittingRef = useRef(false)
  const initializedRef = useRef(false)
  const successRef = useRef(null)

  const product = products.find((item) => item.slug === productSlug) ?? null
  const material = product?.materials.find((item) => item.id === materialId) ?? product?.materials[0] ?? null
  const size = product?.sizes.find((item) => item.id === sizeId) ?? product?.sizes[0] ?? null
  const quantityNumber = Number(quantity) || 0
  const submitting = status === 'loading'

  // Prefill from /produk/:slug → "Pesan Sekarang" query params.
  useEffect(() => {
    if (initializedRef.current || products.length === 0) return
    initializedRef.current = true

    const requestedProduct = products.find((item) => item.slug === searchParams.get('produk'))
    const chosen = requestedProduct ?? products[0]
    const requestedMaterial = chosen.materials.find((item) => item.id === searchParams.get('bahan'))
    const requestedSize = chosen.sizes.find((item) => item.id === searchParams.get('ukuran'))
    const requestedQuantity = Number(searchParams.get('jumlah'))

    setProductSlug(chosen.slug)
    setMaterialId((requestedMaterial ?? chosen.materials[0])?.id ?? '')
    setSizeId((requestedSize ?? chosen.sizes[0])?.id ?? '')
    setQuantity(
      String(
        Number.isFinite(requestedQuantity) && requestedQuantity >= chosen.minOrder
          ? Math.floor(requestedQuantity)
          : chosen.minOrder,
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  useEffect(() => {
    if (status !== 'success') return
    successRef.current?.focus()
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [status])

  const price = useMemo(() => {
    if (!product || !material || !size) return null
    return calculatePrice({
      basePrice: product.basePrice,
      quantity: quantityNumber,
      materialFactor: material.factor,
      sizeFactor: size.factor,
    })
  }, [product, material, size, quantityNumber])

  const handleCustomerChange = (key, value) => {
    setCustomer((current) => ({ ...current, [key]: value }))
    if (attempted || errors[key]) {
      setErrors((current) => ({ ...current, [key]: validateCustomerField(key, value) }))
    }
  }

  const handleCustomerBlur = (key) => {
    if (!attempted && !customer[key].trim()) return
    setErrors((current) => ({ ...current, [key]: validateCustomerField(key, customer[key]) }))
  }

  const handleProductChange = (slug) => {
    const next = products.find((item) => item.slug === slug)
    if (!next) return
    setProductSlug(next.slug)
    setMaterialId(next.materials[0]?.id ?? '')
    setSizeId(next.sizes[0]?.id ?? '')
    setQuantity(String(next.minOrder))
    setErrors((current) => ({ ...current, product: '', material: '', size: '', quantity: '' }))
  }

  const handleQuantityChange = (value) => {
    setQuantity(value)
    if (attempted || errors.quantity) {
      setErrors((current) => ({ ...current, quantity: validateQuantity(value, product?.minOrder ?? 1) }))
    }
  }

  const handleFile = (nextFile) => {
    const message = validateFile(nextFile)
    if (message) {
      setErrors((current) => ({ ...current, file: message }))
      return
    }
    setFile(nextFile)
    setErrors((current) => ({ ...current, file: '' }))
  }

  const handleRemoveFile = () => {
    setFile(null)
    setErrors((current) => ({ ...current, file: '' }))
  }

  const validateForm = () => {
    const next = {}

    if (!product) next.product = 'Pilih produk yang ingin dicetak.'
    if (product && !material) next.material = 'Pilih bahan cetak.'
    if (product && !size) next.size = 'Pilih ukuran cetak.'

    ;['name', 'email', 'phone', 'address'].forEach((key) => {
      const message = validateCustomerField(key, customer[key])
      if (message) next[key] = message
    })

    const quantityMessage = validateQuantity(quantity, product?.minOrder ?? 1)
    if (quantityMessage) next.quantity = quantityMessage

    const fileMessage = validateFile(file)
    if (fileMessage) next.file = fileMessage

    return next
  }

  const focusFirstError = (nextErrors) => {
    const order = ['product', 'name', 'email', 'phone', 'address', 'quantity']
    const key = order.find((field) => nextErrors[field])
    if (!key) return
    const element = document.getElementById(fieldIds[key])
    if (!element) return
    requestAnimationFrame(() => {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const handleProgress = (event) => {
    const ratio = event?.total ? event.loaded / event.total : (event?.progress ?? 0)
    setProgress(Math.max(1, Math.min(99, Math.round(ratio * 100))))
  }

  const submitOrder = async () => {
    if (submittingRef.current) return

    const nextErrors = validateForm()
    setErrors(nextErrors)
    setAttempted(true)

    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstError(nextErrors)
      return
    }
    if (!product || !material || !size || !price || !file) return

    submittingRef.current = true
    setStatus('loading')
    setSubmitError('')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('customer_name', customer.name.trim())
      formData.append('customer_email', customer.email.trim())
      formData.append('customer_phone', customer.phone.trim())
      formData.append('customer_address', customer.address.trim())
      formData.append('product_id', product.id)
      formData.append('product_slug', product.slug)
      formData.append('product_name', product.name)
      formData.append('material_id', material.id)
      formData.append('material_label', material.label)
      formData.append('size_id', size.id)
      formData.append('size_label', size.label)
      formData.append('quantity', String(price.quantity))
      formData.append('notes', customer.notes.trim())
      formData.append('unit_price', String(price.unitPrice))
      formData.append('subtotal', String(price.subtotal))
      formData.append('discount_rate', String(price.discountRate))
      formData.append('discount_amount', String(price.discountAmount))
      formData.append('total', String(price.total))
      formData.append('file', file, file.name)

      const order = await createOrder(formData, { onUploadProgress: handleProgress })
      setResult(order)
      setProgress(100)
      setStatus('success')
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
      setStatus('error')
    } finally {
      submittingRef.current = false
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitOrder()
  }

  const resetForm = () => {
    setCustomer(emptyCustomer)
    setFile(null)
    setErrors({})
    setAttempted(false)
    setStatus('idle')
    setResult(null)
    setSubmitError('')
    setProgress(0)
    if (product) {
      setMaterialId(product.materials[0]?.id ?? '')
      setSizeId(product.sizes[0]?.id ?? '')
      setQuantity(String(product.minOrder))
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (productsLoading) return <OrderSkeleton />

  if (productsError) {
    return (
      <div className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin">
        <Breadcrumbs items={[{ label: 'Katalog', to: '/katalog' }, { label: 'Buat Pesanan' }]} />
        <Alert
          tone="error"
          title="Formulir pesanan belum bisa dimuat"
          className="mt-5"
          action={
            <Button variant="outline" size="sm" onClick={retry}>
              Coba lagi
            </Button>
          }
        >
          {productsError}
        </Alert>
      </div>
    )
  }

  const hasFieldErrors = attempted && Object.values(errors).some(Boolean)
  const submitLabel =
    progress > 0 && progress < 100 ? `Mengunggah berkas ${progress}%` : 'Memproses pesanan…'

  return (
    <div className="pb-4">
      <section className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin">
        <Breadcrumbs items={[{ label: 'Katalog', to: '/katalog' }, { label: 'Buat Pesanan' }]} />

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-secondary-container">
              <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
              Formulir pesanan
            </span>
            <h1 className="mt-2 font-display-mobile text-display-mobile tracking-tight text-on-surface sm:font-display sm:text-display">
              Racik pesanan <span className="text-primary">cetakmu.</span>
            </h1>
            <p className="mt-2 max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              Lengkapi spesifikasi, unggah berkas siap cetak, dan lihat total harga secara langsung. Tim prepress akan
              memverifikasi berkas sebelum produksi.
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-label-caps text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              isMockMode ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'
            }`}
          >
            <span className={`h-2 w-2 animate-pulse rounded-full ${isMockMode ? 'bg-primary' : 'bg-tertiary'}`} aria-hidden="true" />
            {isMockMode ? 'Mode demo · data lokal' : 'Terhubung ke API'}
          </span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-studio px-4 pt-6 sm:px-6 lg:px-margin" aria-label="Formulir pemesanan cetak">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            {status === 'success' ? (
              <div className="rounded-3xl border border-tertiary/30 bg-surface-container-lowest p-5 shadow-card sm:p-8">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary-container text-on-tertiary-container shadow-hard-sm">
                  <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </span>
                <h2
                  ref={successRef}
                  tabIndex={-1}
                  className="mt-4 font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface outline-none sm:font-headline-lg sm:text-headline-lg"
                >
                  Pesanan berhasil dikirim!
                </h2>
                <p className="mt-2 max-w-xl font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  Simpan kode pesanan di bawah. Tim prepress akan memeriksa berkas desainmu dan memperbarui status
                  pesanan melalui panel admin.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="font-label-caps text-[10px] uppercase tracking-wider text-outline">Kode pesanan</span>
                  <p className="rounded-xl border border-on-surface bg-primary-container px-3.5 py-2 font-headline-sm text-headline-sm font-bold tracking-tight text-on-primary-container shadow-hard-sm">
                    {result?.code ?? result?.id ?? '—'}
                  </p>
                  {result?.status ? <StatusBadge status={result.status} /> : null}
                </div>

                <dl className="mt-6 grid gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Produk</dt>
                    <dd className="mt-0.5 font-label-lg text-label-lg font-bold text-on-surface">{product?.name}</dd>
                  </div>
                  <div>
                    <dt className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Spesifikasi</dt>
                    <dd className="mt-0.5 font-body-md text-body-md text-on-surface">
                      {material?.label} · {size?.label}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Jumlah</dt>
                    <dd className="mt-0.5 font-body-md text-body-md text-on-surface">
                      {formatNumber(price?.quantity ?? quantityNumber)} {product?.unit}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Total</dt>
                    <dd className="mt-0.5 font-label-lg text-label-lg font-bold text-on-surface">
                      {formatRupiah(result?.total ?? price?.total ?? 0)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button variant="primary" size="lg" onClick={resetForm}>
                    Buat Pesanan Baru
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Link to="/admin/pesanan" className={buttonStyles({ variant: 'outline', size: 'lg' })}>
                    Pantau di panel admin
                  </Link>
                </div>

                <p className="mt-4 flex items-start gap-2 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
                  Konfirmasi dan tagihan final dikirim setelah berkas lolos verifikasi prepress.
                </p>
              </div>
            ) : (
              <form id="order-form" onSubmit={handleSubmit} noValidate>
                <fieldset disabled={submitting} className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0">
                  {hasFieldErrors ? (
                    <Alert tone="warning" title="Ada isian yang perlu dilengkapi">
                      Periksa kembali kolom bertanda merah di bawah. Data yang sudah kamu isi tetap tersimpan.
                    </Alert>
                  ) : null}

                  {status === 'error' ? (
                    <Alert
                      tone="error"
                      title="Pesanan belum terkirim"
                      action={
                        <Button variant="outline" size="sm" onClick={submitOrder}>
                          Coba kirim ulang
                        </Button>
                      }
                    >
                      {submitError}
                      <p className="mt-1 font-body-sm text-body-sm">
                        Semua data dan berkas masih tersimpan di formulir. Kamu bisa mencoba lagi tanpa mengisi ulang.
                      </p>
                    </Alert>
                  ) : null}

                  <FormSection
                    step="01"
                    icon={PackageCheck}
                    title="Produk & spesifikasi"
                    description="Harga satuan mengikuti bahan dan ukuran yang kamu pilih."
                  >
                    <Select
                      id="produk"
                      label="Produk cetak"
                      required
                      value={productSlug}
                      onChange={(event) => handleProductChange(event.target.value)}
                      error={errors.product}
                      hint={`${formatNumber(products.length)} produk siap cetak tersedia.`}
                    >
                      {products.map((item) => (
                        <option key={item.id} value={item.slug}>
                          {item.name} — {item.category}
                        </option>
                      ))}
                    </Select>

                    {product ? (
                      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-3">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-16 w-20 shrink-0 rounded-xl border border-outline-variant/40 object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-label-lg text-label-lg font-bold text-on-surface">{product.name}</p>
                          <p className="mt-0.5 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                            {product.turnaround} · minimal {formatNumber(product.minOrder)} {product.unit}
                          </p>
                          <p className="mt-0.5 font-label-md text-label-md text-primary">
                            Mulai {formatRupiah(product.priceFrom)} {product.priceUnit}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <fieldset className="mt-4 border-0 p-0">
                      <legend className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                        Bahan <span className="text-error" aria-hidden="true">*</span>
                      </legend>
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        {product?.materials.map((item) => (
                          <ChoiceCard
                            key={item.id}
                            type="radio"
                            name="bahan"
                            value={item.id}
                            checked={material?.id === item.id}
                            onChange={() => setMaterialId(item.id)}
                            title={item.label}
                            description={item.description}
                            meta={`Faktor ×${item.factor}`}
                          />
                        ))}
                      </div>
                      {errors.material ? (
                        <p role="alert" className="mt-1.5 font-body-sm text-body-sm font-semibold text-error">
                          {errors.material}
                        </p>
                      ) : null}
                    </fieldset>

                    <fieldset className="mt-4 border-0 p-0">
                      <legend className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                        Ukuran <span className="text-error" aria-hidden="true">*</span>
                      </legend>
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        {product?.sizes.map((item) => (
                          <ChoiceCard
                            key={item.id}
                            type="radio"
                            name="ukuran"
                            value={item.id}
                            checked={size?.id === item.id}
                            onChange={() => setSizeId(item.id)}
                            title={item.label}
                            description={item.description}
                            meta={`Faktor ×${item.factor}`}
                          />
                        ))}
                      </div>
                      {errors.size ? (
                        <p role="alert" className="mt-1.5 font-body-sm text-body-sm font-semibold text-error">
                          {errors.size}
                        </p>
                      ) : null}
                    </fieldset>

                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                        Jumlah <span className="text-error" aria-hidden="true">*</span>
                      </p>
                      <QuantityStepper
                        id="jumlah"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min={product?.minOrder ?? 1}
                        unit={product?.unit ?? 'pcs'}
                        error={errors.quantity}
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    step="02"
                    icon={UserRound}
                    title="Data pemesan"
                    description="Kami menggunakan data ini untuk konfirmasi proof dan pengiriman."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        id="nama"
                        label="Nama lengkap"
                        required
                        icon={UserRound}
                        autoComplete="name"
                        placeholder="Contoh: Sekar Ayu"
                        value={customer.name}
                        onChange={(event) => handleCustomerChange('name', event.target.value)}
                        onBlur={() => handleCustomerBlur('name')}
                        error={errors.name}
                      />
                      <Input
                        id="email"
                        label="Email"
                        type="email"
                        required
                        icon={Mail}
                        autoComplete="email"
                        inputMode="email"
                        placeholder="nama@email.com"
                        value={customer.email}
                        onChange={(event) => handleCustomerChange('email', event.target.value)}
                        onBlur={() => handleCustomerBlur('email')}
                        error={errors.email}
                      />
                      <Input
                        id="telepon"
                        label="Nomor WhatsApp / telepon"
                        type="tel"
                        required
                        icon={Phone}
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="0812 3456 7890"
                        value={customer.phone}
                        onChange={(event) => handleCustomerChange('phone', event.target.value)}
                        onBlur={() => handleCustomerBlur('phone')}
                        error={errors.phone}
                        containerClassName="sm:col-span-2"
                      />
                    </div>
                    <Textarea
                      id="alamat"
                      label="Alamat pengiriman / penagihan"
                      required
                      rows={3}
                      autoComplete="street-address"
                      placeholder="Jalan, nomor, kota, kode pos"
                      value={customer.address}
                      onChange={(event) => handleCustomerChange('address', event.target.value)}
                      onBlur={() => handleCustomerBlur('address')}
                      error={errors.address}
                      hint="Alamat lengkap membantu kami menghitung ongkos kirim jika diperlukan."
                      containerClassName="mt-4"
                    />
                  </FormSection>

                  <FormSection
                    step="03"
                    icon={UploadCloud}
                    title="Berkas & catatan"
                    description="Unggah desain siap cetak. Tim prepress memeriksa resolusi, bleed, dan profil warna."
                  >
                    <FileUpload
                      file={file}
                      onFile={handleFile}
                      onRemove={handleRemoveFile}
                      error={errors.file}
                      disabled={submitting}
                    />

                    <Textarea
                      id="catatan"
                      label="Catatan tambahan"
                      rows={3}
                      placeholder="Contoh: lipat tri-fold, warna hijau botani, mohon sertakan 2 lembar cadangan."
                      value={customer.notes}
                      onChange={(event) => handleCustomerChange('notes', event.target.value)}
                      hint={`Opsional · ${customer.notes.length}/1000 karakter`}
                      maxLength={1000}
                      containerClassName="mt-4"
                    />

                    <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-primary-container/25 p-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                        Belum punya berkas final? Kamu tetap bisa mengirim pesanan dengan draft, lalu tim studio
                        menghubungi kamu untuk revisi sebelum produksi.
                      </p>
                    </div>
                  </FormSection>
                </fieldset>
              </form>
            )}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4" aria-label="Ringkasan harga pesanan">
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">
              {price && product && material && size ? (
                <PriceSummary product={product} material={material} size={size} quantity={quantityNumber} price={price}>
                  {status === 'success' ? (
                    <div className="rounded-xl border border-tertiary/30 bg-tertiary-container/60 p-3.5">
                      <p className="flex items-center gap-2 font-label-md text-label-md font-bold text-on-tertiary-container">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Pesanan {result?.code ?? result?.id} sudah masuk antrean
                      </p>
                      <p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-tertiary-container">
                        Status awal: Menunggu Verifikasi. Pantau perubahan status di panel admin.
                      </p>
                    </div>
                  ) : (
                    <>
                      {status === 'loading' ? (
                        <div className="rounded-xl bg-surface-container-low p-3">
                          <div className="flex items-center justify-between font-body-sm text-body-sm">
                            <span className="text-on-surface-variant">Mengunggah berkas desain…</span>
                            <span className="font-bold text-on-surface">{progress}%</span>
                          </div>
                          <div
                            className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high"
                            role="progressbar"
                            aria-label="Progres unggah berkas desain"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress}
                          >
                            <div
                              className="h-full rounded-full bg-primary transition-[width] duration-150"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-1.5 font-body-sm text-[11px] text-on-surface-variant">
                            Jangan tutup halaman ini sampai pesanan selesai dikirim.
                          </p>
                        </div>
                      ) : null}

                      <Button
                        type="submit"
                        form="order-form"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={submitting}
                        loadingLabel={submitLabel}
                        disabled={!price}
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Kirim Pesanan
                      </Button>
                      <p className="text-center font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                        Belum ada pembayaran di tahap ini. Tagihan final dikirim setelah berkas diverifikasi.
                      </p>
                    </>
                  )}
                </PriceSummary>
              ) : (
                <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 p-5 text-center">
                  <p className="font-label-lg text-label-lg text-on-surface">Ringkasan harga belum tersedia</p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Pilih produk, bahan, dan ukuran untuk melihat estimasi harga.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
                <p className="font-label-caps text-[10px] uppercase tracking-wider text-outline">Butuh bantuan?</p>
                <p className="mt-1 font-label-lg text-label-lg font-bold text-on-surface">Ngobrol dengan tim studio</p>
                <p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  Ragu soal bahan atau ukuran? Kami bantu pilih spesifikasi yang paling pas.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="tel:+6281234567890"
                    className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    +62 812 3456 7890
                  </a>
                  <a
                    href="mailto:halo@faeyza.studio"
                    className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    halo@faeyza.studio
                  </a>
                  <p className="flex items-start gap-2 font-body-sm text-[11px] text-on-surface-variant">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    Jl. Kreatif No. 12, Bandung · Senin–Sabtu 09.00–18.00 WIB
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default OrderPage
