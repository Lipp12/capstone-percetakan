export const ORDER_STATUS = {
  MENUNGGU: "menunggu",
  DIVERIFIKASI: "diverifikasi",
  DIPROSES: "diproses",
  SELESAI: "selesai",
  DITOLAK: "ditolak",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface StatusMeta {
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  dot: string;
  tone: string;
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  [ORDER_STATUS.MENUNGGU]: {
    label: "Menunggu Verifikasi",
    shortLabel: "Menunggu",
    description: "Pesanan baru masuk dan menunggu pengecekan berkas oleh admin.",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    tone: "butter",
  },
  [ORDER_STATUS.DIVERIFIKASI]: {
    label: "Diverifikasi",
    shortLabel: "Diverifikasi",
    description: "Berkas sudah dicek dan pesanan siap masuk antrean produksi.",
    badge: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
    tone: "sky",
  },
  [ORDER_STATUS.DIPROSES]: {
    label: "Diproses",
    shortLabel: "Diproses",
    description: "Pesanan sedang dicetak dan menjalani proses finishing.",
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
    tone: "blush",
  },
  [ORDER_STATUS.SELESAI]: {
    label: "Selesai",
    shortLabel: "Selesai",
    description: "Pesanan selesai dan sudah diserahkan / siap diambil.",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    tone: "mint",
  },
  [ORDER_STATUS.DITOLAK]: {
    label: "Ditolak",
    shortLabel: "Ditolak",
    description: "Pesanan ditolak. Alasan penolakan tersimpan pada detail pesanan.",
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
    tone: "error",
  },
};

export const STATUS_FILTERS = [
  { id: "semua", label: "Semua" },
  { id: ORDER_STATUS.MENUNGGU, label: "Menunggu" },
  { id: ORDER_STATUS.DIVERIFIKASI, label: "Diverifikasi" },
  { id: ORDER_STATUS.DIPROSES, label: "Diproses" },
  { id: ORDER_STATUS.SELESAI, label: "Selesai" },
  { id: ORDER_STATUS.DITOLAK, label: "Ditolak" },
];

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  [ORDER_STATUS.MENUNGGU]: ORDER_STATUS.DIVERIFIKASI,
  [ORDER_STATUS.DIVERIFIKASI]: ORDER_STATUS.DIPROSES,
  [ORDER_STATUS.DIPROSES]: ORDER_STATUS.SELESAI,
  [ORDER_STATUS.SELESAI]: null,
  [ORDER_STATUS.DITOLAK]: null,
};

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  const key = (status ?? ORDER_STATUS.MENUNGGU) as OrderStatus;
  return STATUS_META[key] ?? STATUS_META[ORDER_STATUS.MENUNGGU];
}

export const ALIF_SYNC_STATUS = {
  PENDING: "PENDING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
} as const;