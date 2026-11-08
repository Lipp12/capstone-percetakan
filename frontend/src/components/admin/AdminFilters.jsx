import { Search, X } from 'lucide-react'
import { STATUS_FILTERS } from '../../data/orderStatus'
import { cn } from '../../utils/cn'

export function AdminFilters({ statusFilter, onStatusChange, counts, search, onSearchChange }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div
        className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 xl:pb-0"
        role="group"
        aria-label="Filter status pesanan"
      >
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.id
          const count = counts[filter.id] ?? 0
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onStatusChange(filter.id)}
              aria-pressed={active}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 font-label-md text-label-md transition-all',
                active
                  ? 'bg-primary font-bold text-on-primary shadow-hard-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
              )}
            >
              {filter.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                  active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-lowest text-outline',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative w-full xl:w-80">
        <label htmlFor="cari-pesanan" className="sr-only">
          Cari nomor pesanan, nama pelanggan, atau produk
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
        <input
          id="cari-pesanan"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari no. pesanan / pelanggan / produk…"
          className="field-base py-2.5 pl-9 pr-9"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container"
            aria-label="Hapus kata kunci pencarian"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default AdminFilters
