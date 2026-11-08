import { useEffect, useState } from 'react'
import { PackageCheck, Printer, ShieldCheck, XCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/Badge'
import { Alert } from '../ui/Alert'
import { ORDER_STATUS, getStatusMeta } from '../../data/orderStatus'

const statusCopy = {
  [ORDER_STATUS.DIVERIFIKASI]: {
    title: 'Verifikasi pesanan ini?',
    description: 'Berkas akan ditandai sudah dicek prepress dan pesanan siap masuk antrean produksi.',
    confirmLabel: 'Verifikasi Pesanan',
    icon: ShieldCheck,
    tone: 'primary',
  },
  [ORDER_STATUS.DIPROSES]: {
    title: 'Mulai proses produksi?',
    description: 'Pesanan akan ditandai sedang dicetak dan menjalani proses finishing.',
    confirmLabel: 'Mulai Produksi',
    icon: Printer,
    tone: 'secondary',
  },
  [ORDER_STATUS.SELESAI]: {
    title: 'Tandai pesanan selesai?',
    description: 'Pastikan pesanan sudah diperiksa, dikemas, dan diserahkan kepada pelanggan atau kurir.',
    confirmLabel: 'Tandai Selesai',
    icon: PackageCheck,
    tone: 'mint',
  },
}

const rejectCopy = {
  title: 'Tolak pesanan ini?',
  description: 'Alasan penolakan wajib diisi agar pelanggan tahu perbaikan yang dibutuhkan sebelum mengunggah ulang berkas.',
  confirmLabel: 'Tolak Pesanan',
  icon: XCircle,
  tone: 'danger',
}

export function StatusUpdateModal({
  open,
  mode = 'status',
  order,
  targetStatus,
  loading = false,
  error = '',
  onClose,
  onConfirm,
}) {
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    if (!open) return
    setNote('')
    setReason('')
    setFieldError('')
  }, [open, order?.id, targetStatus, mode])

  if (!order) return null

  const isReject = mode === 'reject'
  const copy = isReject ? rejectCopy : statusCopy[targetStatus] ?? statusCopy[ORDER_STATUS.DIVERIFIKASI]
  const Icon = copy.icon
  const currentMeta = getStatusMeta(order.status)
  const targetMeta = getStatusMeta(targetStatus)

  const handleConfirm = () => {
    if (isReject && reason.trim().length < 8) {
      setFieldError('Mohon tulis alasan penolakan minimal 8 karakter.')
      return
    }
    setFieldError('')
    onConfirm({
      status: targetStatus,
      note: note.trim(),
      rejectReason: isReject ? reason.trim() : null,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title}
      description={`Pesanan ${order.code}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batalkan
          </Button>
          <Button variant={copy.tone} onClick={handleConfirm} loading={loading} loadingLabel="Menyimpan…">
            {copy.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-label-lg text-label-lg font-semibold text-on-surface">{copy.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={order.status} short />
              <span className="text-outline" aria-hidden="true">
                →
              </span>
              <StatusBadge status={targetStatus} short />
            </div>
          </div>
        </div>

        {!isReject ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status-note" className="font-label-md text-label-md text-on-surface">
              Catatan perubahan <span className="font-normal text-on-surface-variant">(opsional)</span>
            </label>
            <textarea
              id="status-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={280}
              placeholder={`Contoh: ${currentMeta.shortLabel} selesai diperiksa, lanjut ke ${targetMeta.shortLabel.toLowerCase()}.`}
              className="field-base resize-y"
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Catatan akan tersimpan pada riwayat pesanan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reject-reason" className="font-label-md text-label-md text-on-surface">
              Alasan penolakan <span className="text-error">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={4}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                if (fieldError) setFieldError('')
              }}
              maxLength={400}
              required
              aria-invalid={fieldError ? 'true' : undefined}
              aria-describedby={fieldError ? 'reject-reason-error' : 'reject-reason-hint'}
              placeholder="Contoh: Resolusi gambar utama 96 DPI dan bleed 3 mm belum tersedia. Mohon unggah ulang berkas siap cetak."
              className="field-base resize-y"
            />
            {fieldError ? (
              <p id="reject-reason-error" role="alert" className="font-body-sm text-body-sm font-semibold text-error">
                {fieldError}
              </p>
            ) : (
              <p id="reject-reason-hint" className="font-body-sm text-body-sm text-on-surface-variant">
                Tuliskan perbaikan yang perlu dilakukan pelanggan. Alasan ikut tampil di detail pesanan.
              </p>
            )}
          </div>
        )}

        {error ? (
          <Alert tone="error" title="Perubahan status gagal">
            {error}
          </Alert>
        ) : null}
      </div>
    </Modal>
  )
}

export default StatusUpdateModal
