import { CalendarClock, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { formatNumber, formatRupiah } from '../../utils/format'
import { getDiscountRate } from '../../utils/calculatePrice'

function nextDiscountHint(quantity) {
  const qty = Number(quantity) || 0
  if (qty <= 0) return null
  if (qty < 100) return `Tambah ${formatNumber(100 - qty)} pcs lagi untuk diskon 5%.`
  if (qty < 500) return `Tambah ${formatNumber(500 - qty)} pcs lagi untuk diskon 10%.`
  return 'Kamu sudah mendapat diskon grosir maksimal 10%.'
}

export function PriceSummary({ product, material, size, quantity, price, children }) {
  const qty = Number(quantity) || 0
  const hasDiscount = price.discountAmount > 0
  const currentRate = getDiscountRate(qty)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-lift">
      <div className="flex items-center justify-between gap-2 border-b border-surface-container pb-4">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Rincian Harga</h2>
          <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">Kalkulasi otomatis</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Live
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-label-md text-label-md font-semibold text-on-surface">{product.name}</p>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              {formatNumber(qty)} {product.unit} × {formatRupiah(price.unitPrice)}
            </p>
          </div>
          <span className="shrink-0 font-label-md text-label-md font-semibold text-on-surface">{formatRupiah(price.subtotal)}</span>
        </div>

        <div className="flex items-start justify-between gap-3 border-t border-outline-variant/30 pt-2.5">
          <div>
            <p className="font-label-md text-label-md text-on-surface">Bahan</p>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{material.label}</p>
          </div>
          <span className="shrink-0 font-label-md text-label-md text-on-surface-variant">×{material.factor}</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-label-md text-label-md text-on-surface">Ukuran</p>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{size.label}</p>
          </div>
          <span className="shrink-0 font-label-md text-label-md text-on-surface-variant">×{size.factor}</span>
        </div>

        <div className="flex items-start justify-between gap-3 border-t border-outline-variant/30 pt-2.5">
          <div>
            <p className="font-label-md text-label-md text-on-surface">Harga satuan</p>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              {formatRupiah(product.basePrice)} × {material.factor} × {size.factor}
            </p>
          </div>
          <span className="shrink-0 font-label-md text-label-md font-semibold text-on-surface">
            {formatRupiah(price.unitPrice)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-3">
        <div className="flex items-center justify-between gap-2 font-body-sm text-body-sm">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="font-semibold text-on-surface">{formatRupiah(price.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 font-body-sm text-body-sm">
          <span className={hasDiscount ? 'text-tertiary' : 'text-on-surface-variant'}>
            Diskon grosir {hasDiscount ? `(${price.discountPercent}%)` : ''}
          </span>
          <span className={hasDiscount ? 'font-semibold text-tertiary' : 'text-on-surface-variant'}>
            {hasDiscount ? `− ${formatRupiah(price.discountAmount)}` : 'Belum berlaku'}
          </span>
        </div>
        <p className="border-t border-dashed border-outline-variant/50 pt-2 font-body-sm text-body-sm text-on-surface-variant">
          {nextDiscountHint(qty)}
        </p>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="font-subheading text-subheading font-medium text-on-surface-variant">Total harga</span>
        <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface" data-testid="order-total">
          {formatRupiah(price.total)}
        </span>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-primary-container/40 p-3 text-on-primary-container">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-label-caps text-label-caps font-bold uppercase tracking-wider text-primary">Estimasi pengerjaan</p>
          <p className="mt-0.5 font-body-sm text-body-sm font-semibold">{product.turnaround} setelah berkas disetujui</p>
        </div>
      </div>

      {children}

      <div className="flex items-start gap-2 border-t border-surface-container pt-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
        <p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
          Berkas diperiksa manual oleh tim prepress. {currentRate > 0 ? <><Check className="inline h-3 w-3 text-tertiary" aria-hidden="true" /> Diskon {Math.round(currentRate * 100)}% sudah diterapkan.</> : 'Tanpa biaya tersembunyi.'}
        </p>
      </div>
    </div>
  )
}

export default PriceSummary
