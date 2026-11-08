import { Clock3, Printer, ReceiptText, Wallet } from 'lucide-react'
import { ORDER_STATUS } from '../../data/orderStatus'
import { formatNumber, formatRupiah } from '../../utils/format'
import { Skeleton } from '../ui/Skeleton'

const cards = [
  {
    key: 'total',
    label: 'Total Pesanan',
    caption: 'Seluruh antrean',
    icon: ReceiptText,
    tone: 'bg-primary-container text-on-primary-container',
  },
  {
    key: 'menunggu',
    label: 'Menunggu Verifikasi',
    caption: 'Perlu dicek prepress',
    icon: Clock3,
    tone: 'bg-secondary-container text-on-secondary-fixed',
  },
  {
    key: 'produksi',
    label: 'Dalam Produksi',
    caption: 'Diverifikasi dan dicetak',
    icon: Printer,
    tone: 'bg-surface-container-high text-primary',
  },
  {
    key: 'pendapatan',
    label: 'Nilai Pesanan',
    caption: 'Tanpa pesanan ditolak',
    icon: Wallet,
    tone: 'bg-tertiary-container text-on-tertiary-container',
  },
]

export function OrderMetrics({ orders, loading }) {
  const stats = orders.reduce(
    (accumulator, order) => {
      accumulator.total += 1
      if (order.status === ORDER_STATUS.MENUNGGU) accumulator.menunggu += 1
      if (order.status === ORDER_STATUS.DIVERIFIKASI || order.status === ORDER_STATUS.DIPROSES) accumulator.produksi += 1
      if (order.status !== ORDER_STATUS.DITOLAK) accumulator.pendapatan += Number(order.total) || 0
      return accumulator
    },
    { total: 0, menunggu: 0, produksi: 0, pendapatan: 0 },
  )

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const value =
          card.key === 'pendapatan' ? formatRupiah(stats.pendapatan) : formatNumber(stats[card.key])
        return (
          <div
            key={card.key}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 shadow-sm sm:p-4"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${card.tone}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant sm:text-[10px]">
                {card.label}
              </p>
              {loading ? (
                <Skeleton className="mt-1 h-6 w-20" />
              ) : (
                <p className="truncate font-headline-sm text-[1.05rem] font-bold leading-tight text-on-surface sm:text-headline-sm">
                  {value}
                </p>
              )}
              <p className="mt-0.5 hidden font-body-sm text-[11px] text-on-surface-variant sm:block">{card.caption}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrderMetrics
