// Status pesanan mengikuti alur produksi studio:
// Menunggu Verifikasi → Diverifikasi → Diproses → Selesai (+ Ditolak).
export const ORDER_STATUS = {
  MENUNGGU: 'menunggu',
  DIVERIFIKASI: 'diverifikasi',
  DIPROSES: 'diproses',
  SELESAI: 'selesai',
  DITOLAK: 'ditolak',
}

export const STATUS_META = {
  [ORDER_STATUS.MENUNGGU]: {
    label: 'Menunggu Verifikasi',
    shortLabel: 'Menunggu',
    description: 'Pesanan baru masuk dan menunggu pengecekan berkas oleh admin.',
    badge: 'bg-primary-container text-on-primary-container',
    dot: 'bg-primary',
    tone: 'butter',
  },
  [ORDER_STATUS.DIVERIFIKASI]: {
    label: 'Diverifikasi',
    shortLabel: 'Diverifikasi',
    description: 'Berkas sudah dicek dan pesanan siap masuk antrean produksi.',
    badge: 'bg-[#d9edf5] text-[#204e60]',
    dot: 'bg-[#2f7d95]',
    tone: 'sky',
  },
  [ORDER_STATUS.DIPROSES]: {
    label: 'Diproses',
    shortLabel: 'Diproses',
    description: 'Pesanan sedang dicetak dan menjalani proses finishing.',
    badge: 'bg-secondary-container text-on-secondary-fixed-variant',
    dot: 'bg-secondary',
    tone: 'blush',
  },
  [ORDER_STATUS.SELESAI]: {
    label: 'Selesai',
    shortLabel: 'Selesai',
    description: 'Pesanan selesai dan sudah diserahkan / siap diambil.',
    badge: 'bg-tertiary-container text-on-tertiary-container',
    dot: 'bg-tertiary',
    tone: 'mint',
  },
  [ORDER_STATUS.DITOLAK]: {
    label: 'Ditolak',
    shortLabel: 'Ditolak',
    description: 'Pesanan ditolak. Alasan penolakan tersimpan pada detail pesanan.',
    badge: 'bg-error-container text-on-error-container',
    dot: 'bg-error',
    tone: 'error',
  },
}

export const STATUS_FILTERS = [
  { id: 'semua', label: 'Semua' },
  { id: ORDER_STATUS.MENUNGGU, label: 'Menunggu' },
  { id: ORDER_STATUS.DIVERIFIKASI, label: 'Diverifikasi' },
  { id: ORDER_STATUS.DIPROSES, label: 'Diproses' },
  { id: ORDER_STATUS.SELESAI, label: 'Selesai' },
  { id: ORDER_STATUS.DITOLAK, label: 'Ditolak' },
]

export const NEXT_STATUS = {
  [ORDER_STATUS.MENUNGGU]: ORDER_STATUS.DIVERIFIKASI,
  [ORDER_STATUS.DIVERIFIKASI]: ORDER_STATUS.DIPROSES,
  [ORDER_STATUS.DIPROSES]: ORDER_STATUS.SELESAI,
  [ORDER_STATUS.SELESAI]: null,
  [ORDER_STATUS.DITOLAK]: null,
}

export const getStatusMeta = (status) => STATUS_META[status] ?? STATUS_META[ORDER_STATUS.MENUNGGU]
