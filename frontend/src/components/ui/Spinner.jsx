import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Spinner({ className, label = 'Memuat…' }) {
  return (
    <span className="inline-flex items-center gap-2 text-on-surface-variant" role="status" aria-live="polite">
      <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default Spinner
