import { useEffect } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const tones = {
  success: {
    wrapper: 'border-tertiary/40 bg-tertiary-container text-on-tertiary-container',
    icon: CheckCircle2,
  },
  error: {
    wrapper: 'border-error/40 bg-error-container text-on-error-container',
    icon: XCircle,
  },
}

export function Toast({ open, tone = 'success', message, onClose, autoHide = 4500 }) {
  useEffect(() => {
    if (!open || !autoHide) return undefined
    const timer = window.setTimeout(() => onClose?.(), autoHide)
    return () => window.clearTimeout(timer)
  }, [open, autoHide, onClose])

  if (!open) return null
  const meta = tones[tone] ?? tones.success
  const Icon = meta.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"
    >
      <div
        className={cn(
          'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lift animate-fade-up',
          meta.wrapper,
        )}
      >
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="flex-1 font-body-md text-body-md font-semibold">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default Toast
