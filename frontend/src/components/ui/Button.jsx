import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const base =
  'inline-flex select-none items-center justify-center gap-2 font-label-lg text-label-lg transition-all duration-150 disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface no-tap-highlight'

const variants = {
  primary:
    'border border-on-surface bg-primary-container text-on-primary-container shadow-hard hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed hover:shadow-[4px_4px_0px_#1c1c19] active:translate-x-0 active:translate-y-0 active:shadow-hard-sm',
  dark:
    'border border-on-surface bg-primary text-on-primary shadow-hard hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_#1c1c19] active:translate-x-0 active:translate-y-0 active:shadow-hard-sm',
  secondary:
    'border border-on-surface bg-secondary-container text-on-secondary-fixed shadow-hard hover:-translate-x-px hover:-translate-y-px hover:bg-secondary-fixed hover:shadow-[4px_4px_0px_#1c1c19] active:translate-x-0 active:translate-y-0 active:shadow-hard-sm',
  mint:
    'border border-on-surface bg-tertiary-container text-on-tertiary-container shadow-hard hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_#1c1c19] active:translate-x-0 active:translate-y-0 active:shadow-hard-sm',
  danger:
    'border border-on-surface bg-error text-on-error shadow-hard hover:-translate-x-px hover:-translate-y-px hover:bg-[#a01717] hover:shadow-[4px_4px_0px_#1c1c19] active:translate-x-0 active:translate-y-0 active:shadow-hard-sm',
  outline:
    'border border-outline-variant bg-surface-container-lowest text-on-surface shadow-sm hover:border-outline hover:bg-surface-container-low',
  ghost:
    'border border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  link: 'text-primary underline decoration-primary/40 decoration-2 underline-offset-4 hover:decoration-primary',
}

const sizes = {
  sm: 'rounded-lg px-3 py-1.5 text-label-md',
  md: 'rounded-xl px-4 py-2.5 text-label-lg',
  lg: 'rounded-xl px-6 py-3.5 text-label-lg',
  icon: 'h-10 w-10 rounded-xl p-0',
}

export function buttonStyles({ variant = 'primary', size = 'md', className } = {}) {
  return cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, className)
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, loading = false, loadingLabel, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{loadingLabel ?? 'Memproses…'}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
})

export default Button
