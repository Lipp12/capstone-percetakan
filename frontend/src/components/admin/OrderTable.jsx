import { Eye, FileText, Image as ImageIcon, ArrowRight } from 'lucide-react'
import { StatusBadge } from '../ui/Badge'
import { Skeleton } from '../ui/Skeleton'
import { formatDate, formatFileSize, formatNumber, formatRupiah, fileExtension, truncateFileName } from '../../utils/format'

function FileCell({ file, onOpen, compact = false }) {
  if (!file) {
    return <span className="font-body-sm text-body-sm text-outline">Belum ada berkas</span>
  }

  const extension = fileExtension(file.name).toUpperCase()
  const isImage = ['png', 'jpg', 'jpeg'].includes(fileExtension(file.name))
  const Icon = isImage ? ImageIcon : FileText

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onOpen(file)
      }}
      className={`flex max-w-full items-center gap-2 rounded-lg text-left transition-colors hover:bg-surface-container ${compact ? 'p-1.5' : 'p-1'}`}
      aria-label={`Pratinjau berkas ${file.name}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block max-w-[160px] truncate font-label-md text-label-md font-semibold text-on-surface">
          {truncateFileName(file.name, 28)}
        </span>
        <span className="block font-body-sm text-[11px] text-on-surface-variant">
          {extension} · {formatFileSize(file.size)}
        </span>
      </span>
    </button>
  )
}

export function OrderTable({ orders, loading, onOpenDetail, onOpenFile }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3.5">No. Pesanan</th>
                <th className="px-4 py-3.5">Pelanggan</th>
                <th className="px-4 py-3.5">Produk & Kuantitas</th>
                <th className="px-4 py-3.5">Berkas</th>
                <th className="px-4 py-3.5 text-right">Total</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/70">
              {Array.from({ length: 6 }, (_, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1.5 h-3 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1.5 h-3 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-28" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-8 w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="mx-auto h-8 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-3 lg:hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-xl border border-outline-variant/30 p-4">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-52" />
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <caption className="sr-only">Daftar pesanan pelanggan Faeyza Digital Printing Studio</caption>
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              <th scope="col" className="px-4 py-3.5">
                No. Pesanan
              </th>
              <th scope="col" className="px-4 py-3.5">
                Pelanggan
              </th>
              <th scope="col" className="px-4 py-3.5">
                Produk & Kuantitas
              </th>
              <th scope="col" className="px-4 py-3.5">
                Berkas
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Total
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/70 font-body-md text-body-md">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onOpenDetail(order)}
                className="cursor-pointer transition-colors hover:bg-surface-container-low/50"
              >
                <td className="px-4 py-3.5 align-middle">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenDetail(order)
                    }}
                    className="block rounded text-left font-label-lg text-label-lg font-bold tracking-tight text-on-surface transition-colors hover:text-primary"
                  >
                    {order.code}
                  </button>
                  <span className="mt-0.5 block font-body-sm text-[11px] text-on-surface-variant">
                    {formatDate(order.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle">
                  <span className="block max-w-[180px] truncate font-label-lg text-label-lg font-semibold text-on-surface">
                    {order.customer?.name || 'Tanpa nama'}
                  </span>
                  <span className="mt-0.5 block max-w-[180px] truncate font-body-sm text-[11px] text-on-surface-variant">
                    {order.customer?.phone || order.customer?.email || '—'}
                  </span>
                </td>
                <td className="max-w-[220px] px-4 py-3.5 align-middle">
                  <span className="block truncate font-label-lg text-label-lg font-semibold text-on-surface">
                    {order.product?.name || 'Produk cetak'}
                  </span>
                  <span className="mt-0.5 block truncate font-body-sm text-[11px] text-on-surface-variant">
                    {[order.material, order.size].filter(Boolean).join(' · ') || 'Spesifikasi standar'}
                  </span>
                  <span className="mt-1 inline-flex rounded bg-primary-container/50 px-1.5 py-0.5 font-label-caps text-[10px] font-bold text-on-primary-container">
                    {formatNumber(order.quantity)} pcs
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle">
                  <FileCell file={order.file} onOpen={onOpenFile} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle font-label-lg text-label-lg font-bold text-on-surface">
                  {formatRupiah(order.total)}
                </td>
                <td className="px-4 py-3.5 align-middle">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3.5 text-center align-middle">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenDetail(order)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                    aria-label={`Buka detail pesanan ${order.code}`}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-surface-container/70 lg:hidden">
        {orders.map((order) => (
          <li key={order.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpenDetail(order)}
                  className="block max-w-full truncate rounded text-left font-label-lg text-label-lg font-bold text-on-surface"
                >
                  {order.code}
                </button>
                <p className="mt-0.5 font-body-sm text-[11px] text-on-surface-variant">{formatDate(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} short className="shrink-0" />
            </div>

            <button
              type="button"
              onClick={() => onOpenDetail(order)}
              className="mt-3 block w-full rounded-lg text-left"
            >
              <p className="truncate font-label-lg text-label-lg font-semibold text-on-surface">
                {order.customer?.name || 'Tanpa nama'}
              </p>
              <p className="mt-0.5 truncate font-body-sm text-body-sm text-on-surface-variant">
                {order.product?.name || 'Produk cetak'} · {formatNumber(order.quantity)} pcs
              </p>
              <p className="mt-1 truncate font-body-sm text-[11px] text-on-surface-variant">
                {[order.material, order.size].filter(Boolean).join(' · ')}
              </p>
            </button>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-surface-container pt-3">
              <FileCell file={order.file} onOpen={onOpenFile} compact />
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">{formatRupiah(order.total)}</span>
                <button
                  type="button"
                  onClick={() => onOpenDetail(order)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-primary"
                  aria-label={`Buka detail pesanan ${order.code}`}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OrderTable
