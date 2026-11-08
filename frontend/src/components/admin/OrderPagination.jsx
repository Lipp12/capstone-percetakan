import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

function pageWindow(page, totalPages) {
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_, index) => index + 1)
  if (page <= 3) return [1, 2, 3, 4, '…', totalPages]
  if (page >= totalPages - 2) return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, '…', page - 1, page, page + 1, '…', totalPages]
}

export function OrderPagination({ page, totalPages, totalItems, pageSize, onChange }) {
  if (totalItems === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  const pages = pageWindow(page, totalPages)

  return (
    <nav
      aria-label="Navigasi halaman pesanan"
      className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 shadow-sm sm:flex-row"
    >
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Menampilkan <span className="font-bold text-on-surface">{start}</span>–
        <span className="font-bold text-on-surface">{end}</span> dari{' '}
        <span className="font-bold text-on-surface">{totalItems}</span> pesanan
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container disabled:pointer-events-none disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {pages.map((item, index) =>
          item === '…' ? (
            <span key={`gap-${index}`} className="px-1 font-label-md text-label-md text-outline" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Halaman ${item}`}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-label-md text-label-md transition-colors',
                item === page
                  ? 'bg-primary font-bold text-on-primary shadow-hard-sm'
                  : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container',
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container disabled:pointer-events-none disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

export default OrderPagination
