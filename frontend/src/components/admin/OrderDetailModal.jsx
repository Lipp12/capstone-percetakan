import { useEffect, useState } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { StatusBadge } from '../ui/Badge'
import { Alert } from '../ui/Alert'
import { EmptyState } from '../ui/EmptyState'
import { OrderStatusTimeline } from './OrderStatusTimeline'
import { NEXT_STATUS, ORDER_STATUS, getStatusMeta } from '../../data/orderStatus'
import { fileExtension, formatDate, formatDateTime, formatFileSize, formatNumber, formatRupiah } from '../../utils/format'

const flow = [ORDER_STATUS.MENUNGGU, ORDER_STATUS.DIVERIFIKASI, ORDER_STATUS.DIPROSES, ORDER_STATUS.SELESAI]

function InfoCard({ icon: Icon, eyebrow, title, tone, children }) {
  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5 border-b border-outline-variant/20 pb-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div>
          <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">{eyebrow}</p>
          <p className="font-label-lg text-label-lg font-bold text-on-surface">{title}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function actionLabel(order, target) {
  if (target === NEXT_STATUS[order.status]) {
    if (order.status === ORDER_STATUS.MENUNGGU) return 'Verifikasi Pesanan'
    if (order.status === ORDER_STATUS.DIVERIFIKASI) return 'Mulai Produksi'
    if (order.status === ORDER_STATUS.DIPROSES) return 'Tandai Selesai'
  }
  return 'Perbarui Status'
}

export function OrderDetailModal({ open, order, updating, onClose, onOpenFile, onRequestStatus, onRequestReject }) {
  // `flow.indexOf('ditolak')` is -1; without this guard slice(0) would offer
  // every status as a target for a rejected (terminal) order.
  const flowIndex = order ? flow.indexOf(order.status) : -1
  const targets = order && flowIndex >= 0 ? flow.slice(flowIndex + 1) : []
  const [target, setTarget] = useState(targets[0] ?? '')

  useEffect(() => {
    if (open) setTarget(targets[0] ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order?.id, order?.status])

  if (!order) return null

  const canReject = ![ORDER_STATUS.SELESAI, ORDER_STATUS.DITOLAK].includes(order.status)
  const isFinal = targets.length === 0
  const file = order.file
  const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(fileExtension(file?.name))
  const FileIcon = isImage ? ImageIcon : FileText
  const meta = getStatusMeta(order.status)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Pesanan"
      description={`${order.code} · dibuat ${formatDateTime(order.createdAt)}`}
      size="xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low"
        >
          Tutup detail
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">{order.code}</h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{meta.description}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
              <CalendarClock className="h-3.5 w-3.5 text-outline" aria-hidden="true" />
              {formatDateTime(order.createdAt)} WIB
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 sm:text-right">
            <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Total tagihan</p>
            <p className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
              {formatRupiah(order.total)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard icon={UserRound} eyebrow="Identitas order" title="Data Pelanggan" tone="bg-secondary-container text-on-secondary-fixed">
            <div className="space-y-2.5 font-body-md text-body-md">
              <div>
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">Nama pemesan</p>
                <p className="font-label-lg text-label-lg font-bold text-on-surface">{order.customer?.name || '—'}</p>
              </div>
              <p className="flex items-center gap-2 text-on-surface-variant">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={`mailto:${order.customer?.email}`} className="truncate hover:text-primary">
                  {order.customer?.email || '—'}
                </a>
              </p>
              <p className="flex items-center gap-2 text-on-surface-variant">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={`tel:${order.customer?.phone}`} className="hover:text-primary">
                  {order.customer?.phone || '—'}
                </a>
              </p>
            </div>
            <div className="mt-3 flex items-start gap-2 border-t border-outline-variant/20 pt-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
                {order.customer?.address || 'Alamat belum diisi.'}
              </p>
            </div>
          </InfoCard>

          <InfoCard icon={PackageCheck} eyebrow="Parameter produksi" title="Spesifikasi Cetak" tone="bg-primary-container text-on-primary-container">
            <div className="space-y-1.5">
              <div>
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">Item / format</p>
                <p className="font-label-lg text-label-lg font-bold leading-tight text-on-surface">
                  {order.product?.name || 'Produk cetak'}
                </p>
              </div>
              <dl className="divide-y divide-outline-variant/15 border-t border-outline-variant/20 pt-1 font-body-sm text-body-sm">
                <div className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="text-on-surface-variant">Bahan</dt>
                  <dd className="text-right font-label-md text-label-md font-semibold text-on-surface">{order.material || '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="text-on-surface-variant">Ukuran</dt>
                  <dd className="text-right font-label-md text-label-md font-semibold text-on-surface">{order.size || '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="text-on-surface-variant">Kuantitas</dt>
                  <dd className="rounded bg-primary-container/50 px-2 py-0.5 font-label-md text-label-md font-bold text-on-primary-container">
                    {formatNumber(order.quantity)} pcs
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="text-on-surface-variant">Harga satuan</dt>
                  <dd className="text-right font-label-md text-label-md font-semibold text-on-surface">
                    {formatRupiah(order.unitPrice)}
                  </dd>
                </div>
                {Number(order.discount) > 0 ? (
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <dt className="text-on-surface-variant">Diskon grosir</dt>
                    <dd className="text-right font-label-md text-label-md font-semibold text-tertiary">
                      {Math.round(Number(order.discount) * 100)}%
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </InfoCard>

          <InfoCard icon={ShieldCheck} eyebrow="Verifikasi prepress" title="Status & Berkas" tone="bg-tertiary-container text-on-tertiary-container">
            <div className="space-y-2.5">
              <div>
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">Status saat ini</p>
                <div className="mt-1">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <p className="flex items-start gap-2 font-body-sm text-body-sm leading-snug text-on-surface-variant">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
                {meta.description}
              </p>
              {order.rejectReason ? (
                <p className="rounded-lg bg-error-container px-2.5 py-2 font-body-sm text-body-sm font-semibold text-on-error-container">
                  {order.rejectReason}
                </p>
              ) : (
                <p className="rounded-lg bg-surface-container-low px-2.5 py-2 font-body-sm text-body-sm text-on-surface-variant">
                  {file ? 'Berkas desain terlampir dan siap diperiksa.' : 'Belum ada berkas desain terlampir.'}
                </p>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface">Berkas Desain Cetak</h3>
            </div>
            <span className="rounded-full bg-tertiary-container px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider text-on-tertiary-container">
              Siap diperiksa prepress
            </span>
          </div>

          {file ? (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-error-container/40 text-error">
                  <FileIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-label-md text-label-md font-bold text-on-surface" title={file.name}>
                    {file.name}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {fileExtension(file.name).toUpperCase() || 'FILE'} · {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenFile(file)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2 font-label-md text-label-md font-bold text-on-surface transition-colors hover:border-primary/40 hover:text-primary"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Pratinjau berkas
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <EmptyState
                icon={FileText}
                title="Belum ada berkas"
                description="Pelanggan belum mengunggah berkas desain untuk pesanan ini."
                className="py-8"
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
          <h3 className="font-label-lg text-label-lg font-bold text-on-surface">Catatan Pelanggan</h3>
          <p className="mt-1.5 whitespace-pre-line font-body-md text-body-md leading-relaxed text-on-surface-variant">
            {order.notes?.trim() || 'Tidak ada catatan tambahan.'}
          </p>
        </div>

        {order.status === ORDER_STATUS.DITOLAK && order.rejectReason ? (
          <Alert tone="error" title="Pesanan ditolak">
            {order.rejectReason}
          </Alert>
        ) : null}

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface">Riwayat Status</h3>
            </div>
            <span className="rounded-full bg-surface-container-high px-2.5 py-1 font-label-caps text-[10px] font-bold text-on-surface-variant">
              {order.timeline?.length ?? 0} entri
            </span>
          </div>
          <OrderStatusTimeline timeline={order.timeline} />
        </div>

        <div className="rounded-2xl border border-ink bg-ink p-4 text-paper shadow-lift sm:p-5">
          <div className="flex items-start gap-3 border-b border-paper/10 pb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper/10 text-primary-container">
              {isFinal ? <XCircle className="h-5 w-5" aria-hidden="true" /> : <Printer className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div>
              <h3 className="font-headline-sm text-[1.1rem] font-bold tracking-tight">Perbarui Status Pesanan</h3>
              <p className="mt-0.5 font-body-sm text-body-sm leading-snug text-paper/65">
                {isFinal
                  ? 'Pesanan sudah berada di status final. Riwayat tetap dapat dilihat.'
                  : 'Pilih tahapan produksi berikutnya. Perubahan akan dicatat pada riwayat pesanan.'}
              </p>
            </div>
          </div>

          {isFinal ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper/10 px-3.5 py-3 font-label-md text-label-md text-paper/80">
              <CheckCircle2 className="h-4 w-4 text-primary-container" aria-hidden="true" />
              Tidak ada aksi status lanjutan untuk pesanan ini.
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="detail-target-status" className="font-label-md text-label-md font-bold text-paper/85">
                  Ubah status ke
                </label>
                <div className="relative">
                  <select
                    id="detail-target-status"
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    disabled={updating}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-paper/20 bg-[#3b3732] px-3.5 py-3 pr-10 font-body-md text-body-md font-semibold text-paper transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/40 disabled:opacity-60"
                  >
                    {targets.map((status) => (
                      <option key={status} value={status} className="bg-ink text-paper">
                        {getStatusMeta(status).label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/60" aria-hidden="true" />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onRequestStatus(target)}
                  disabled={!target || updating}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-paper/20 bg-primary-container px-4 py-3 font-label-lg text-label-lg font-bold text-on-primary-container transition-all hover:-translate-y-px hover:bg-primary-fixed disabled:pointer-events-none disabled:opacity-55 sm:flex-none"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {actionLabel(order, target)}
                </button>
                {canReject ? (
                  <button
                    type="button"
                    onClick={onRequestReject}
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-paper/15 bg-paper/5 px-4 py-3 font-label-lg text-label-lg font-bold text-error-container transition-colors hover:bg-error/20 disabled:pointer-events-none disabled:opacity-55"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Tolak Pesanan
                  </button>
                ) : null}
              </div>
              <p className="font-body-sm text-[11px] text-paper/45">
                Terakhir diperbarui {formatDate(order.createdAt)} · Aksi status memerlukan konfirmasi.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default OrderDetailModal
