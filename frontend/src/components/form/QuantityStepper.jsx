import { Minus, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatNumber } from '../../utils/format'

export function QuantityStepper({ id, value, onChange, min = 1, step = 1, unit = 'pcs', error, disabled = false }) {
  const numeric = Number(value) || 0
  const decrement = () => onChange(String(Math.max(min, numeric - step)))
  // When the field is empty (or below the product minimum), start from the
  // minimum instead of jumping to an invalid quantity like 1.
  const increment = () => onChange(String(numeric < min ? min : numeric + step))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/50 bg-surface-container-low/50 p-2">
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || numeric <= min}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:opacity-40"
            aria-label={`Kurangi jumlah sebanyak ${step}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex h-11 min-w-[112px] items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 shadow-sm">
            <label htmlFor={id} className="sr-only">
              Jumlah pesanan
            </label>
            <input
              id={id}
              type="number"
              inputMode="numeric"
              min={min}
              step={step}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className="w-20 bg-transparent text-center font-headline-md text-headline-md font-bold text-on-surface focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="ml-1 font-body-sm text-body-sm text-on-surface-variant">{unit}</span>
          </div>
          <button
            type="button"
            onClick={increment}
            disabled={disabled}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:opacity-40"
            aria-label={`Tambah jumlah sebanyak ${step}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          <p>
            Minimal <span className="font-bold text-on-surface">{formatNumber(min)} {unit}</span>
          </p>
          <p className={cn('mt-0.5', error && 'text-error')}>Diskon grosir otomatis mulai 100 pcs.</p>
        </div>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-body-sm text-body-sm font-semibold text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default QuantityStepper
