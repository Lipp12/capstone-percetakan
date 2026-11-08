import { getStatusMeta } from '../../data/orderStatus'
import { cn } from '../../utils/cn'

const tones = {
  butter: 'bg-primary-container text-on-primary-container',
  blush: 'bg-secondary-container text-on-secondary-fixed-variant',
  mint: 'bg-tertiary-container text-on-tertiary-container',
  sky: 'bg-[#d9edf5] text-[#204e60]',
  peach: 'bg-[#fde3d4] text-[#8a3b12]',
  neutral: 'bg-surface-container text-on-surface-variant',
  outline: 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
  dark: 'bg-ink text-paper',
}

const dotTones = {
  butter: 'bg-primary',
  blush: 'bg-secondary',
  mint: 'bg-tertiary',
  sky: 'bg-[#2f7d95]',
  peach: 'bg-accent',
  neutral: 'bg-outline',
  outline: 'bg-outline',
  error: 'bg-error',
  dark: 'bg-paper',
}

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-md text-label-md leading-none',
        tones[tone] ?? tones.neutral,
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', dotTones[tone] ?? dotTones.neutral)} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

export function StatusBadge({ status, className, withDot = true, short = false }) {
  const meta = getStatusMeta(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 font-label-md text-label-md leading-none',
        meta.badge,
        className,
      )}
    >
      {withDot ? <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden="true" /> : null}
      {short ? meta.shortLabel : meta.label}
    </span>
  )
}

export default Badge
