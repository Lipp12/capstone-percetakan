import { getStatusMeta } from '../../data/orderStatus'
import { formatDateTime } from '../../utils/format'
import { cn } from '../../utils/cn'

export function OrderStatusTimeline({ timeline = [] }) {
  const entries = [...timeline].reverse()

  if (!entries.length) {
    return (
      <p className="rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low/60 px-4 py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
        Belum ada riwayat status untuk pesanan ini.
      </p>
    )
  }

  return (
    <ol className="relative ml-2 space-y-5 border-l-2 border-surface-container-highest pl-6">
      {entries.map((entry, index) => {
        const meta = getStatusMeta(entry.status)
        return (
          <li key={`${entry.at}-${index}`} className="relative">
            <span
              className={cn(
                'absolute -left-[31px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-surface-container-lowest',
                meta.dot,
                index === 0 && 'ring-primary-container',
              )}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-1.5">
              <p className="font-label-md text-label-md font-bold text-on-surface">{entry.label || meta.label}</p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">{formatDateTime(entry.at)}</p>
            </div>
            <p className="mt-0.5 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              {entry.note || meta.description}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

export default OrderStatusTimeline
