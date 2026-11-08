import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '../../utils/cn'

const tones = {
  info: {
    wrapper: 'border-outline-variant bg-[#eaf4f8] text-[#204e60]',
    icon: Info,
  },
  success: {
    wrapper: 'border-tertiary/30 bg-tertiary-container text-on-tertiary-container',
    icon: CheckCircle2,
  },
  warning: {
    wrapper: 'border-primary/30 bg-primary-container/60 text-on-primary-container',
    icon: TriangleAlert,
  },
  error: {
    wrapper: 'border-error/30 bg-error-container text-on-error-container',
    icon: AlertCircle,
  },
}

export function Alert({ tone = 'info', title, children, action, className, ...props }) {
  const meta = tones[tone] ?? tones.info
  const Icon = meta.icon

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:gap-3', meta.wrapper, className)}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        {title ? <p className="font-label-lg text-label-lg font-bold">{title}</p> : null}
        {children ? <div className="mt-0.5 font-body-md text-body-md">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 sm:ml-2">{action}</div> : null}
    </div>
  )
}

export default Alert
