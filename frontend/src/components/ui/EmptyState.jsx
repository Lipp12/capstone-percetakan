import { PackageOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

export function EmptyState({ icon: Icon = PackageOpen, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-primary shadow-sm">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-md font-body-md text-body-md text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export default EmptyState
