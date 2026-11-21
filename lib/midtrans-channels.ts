/**
 * Daftar saluran pembayaran yang tampil di checkout.
 * Semua nilai `midtransPayments` adalah kode `enabled_payments` resmi Midtrans.
 *
 * PENTING: pilihan di sini HANYA menentukan metode bayar yang dibuka di popup
 * Snap. Uangnya tetap diterima akun Midtrans toko, lalu disetorkan ke rekening
 * BRI / saldo GoPay toko sesuai pengaturan settlement di Midtrans MAP. Jadi
 * tidak perlu memetakan tiap metode ke rekening yang berbeda-beda.
 *
 * Kalau hanya satu kode diberikan, Snap langsung masuk ke flow metode itu.
 * `midtransPayments: []` = kirim semua kanal aktif (parameter.enabled_payments
 * tidak dikirim).
 */

export type MidtransChannelGroup = "UTAMA" | "TRANSFER" | "LAINNYA";

export type MidtransChannelId =
  | "QRIS"
  | "GOPAY"
  | "BRI"
  | "MANDIRI"
  | "BCA"
  | "BNI"
  | "OTHER_VA"
  | "SHOPEEPAY"
  | "CARD"
  | "RETAIL"
  | "ALL";

export type MidtransChannel = {
  id: MidtransChannelId;
  name: string;
  account: string;
  holder: string;
  /** Kode `enabled_payments` resmi Midtrans. Kosong = semua kanal aktif. */
  midtransPayments: string[];
  /** Pengelompokan supaya daftar tetap rapi. */
  group: MidtransChannelGroup;
  /** Penanda opsional untuk kanal yang merupakan akun utama toko. */
  badge?: string;
};

export const MIDTRANS_CHANNEL_GROUPS: Array<{
  id: MidtransChannelGroup;
  label: string;
}> = [
  { id: "UTAMA", label: "Metode Utama Toko" },
  { id: "TRANSFER", label: "Transfer Bank (Virtual Account)" },
  { id: "LAINNYA", label: "Metode Lainnya" },
];

export const MIDTRANS_CHANNELS: MidtransChannel[] = [
  {
    id: "QRIS",
    name: "QRIS",
    account: "Semua aplikasi QRIS",
    holder: "Scan QR pakai e-wallet / mobile banking",
    midtransPayments: ["other_qris"],
    group: "UTAMA",
  },
  {
    id: "GOPAY",
    name: "GoPay",
    account: "Saldo GoPay",
    holder: "Bayar langsung pakai GoPay",
    midtransPayments: ["gopay"],
    group: "UTAMA",
    badge: "Akun Toko",
  },
  {
    id: "BRI",
    name: "Transfer Bank BRI",
    account: "BRI Virtual Account",
    holder: "Virtual Account BRI",
    midtransPayments: ["bri_va"],
    group: "UTAMA",
    badge: "Akun Toko",
  },
  {
    id: "MANDIRI",
    name: "Transfer Bank Mandiri",
    account: "Mandiri Bill Payment",
    holder: "Diproses otomatis oleh Midtrans",
    midtransPayments: ["echannel"],
    group: "TRANSFER",
  },
  {
    id: "BCA",
    name: "Transfer Bank BCA",
    account: "BCA Virtual Account",
    holder: "Diproses otomatis oleh Midtrans",
    midtransPayments: ["bca_va"],
    group: "TRANSFER",
  },
  {
    id: "BNI",
    name: "Transfer Bank BNI",
    account: "BNI Virtual Account",
    holder: "Diproses otomatis oleh Midtrans",
    midtransPayments: ["bni_va"],
    group: "TRANSFER",
  },
  {
    id: "OTHER_VA",
    name: "Virtual Account Lainnya",
    account: "Permata • CIMB • Other VA",
    holder: "Pilihan VA bank lainnya",
    midtransPayments: ["permata_va", "cimb_va", "other_va"],
    group: "TRANSFER",
  },
  {
    id: "SHOPEEPAY",
    name: "ShopeePay",
    account: "Saldo ShopeePay",
    holder: "Bayar langsung pakai ShopeePay",
    midtransPayments: ["shopeepay"],
    group: "LAINNYA",
  },
  {
    id: "CARD",
    name: "Kartu Kredit / Debit",
    account: "Visa • MasterCard • JCB",
    holder: "Dengan 3D Secure",
    midtransPayments: ["credit_card"],
    group: "LAINNYA",
  },
  {
    id: "RETAIL",
    name: "Gerai Retail",
    account: "Indomaret",
    holder: "Bayar tunai di gerai retail",
    midtransPayments: ["indomaret"],
    group: "LAINNYA",
  },
  {
    id: "ALL",
    name: "Semua Metode Midtrans",
    account: "Pilih langsung di halaman Midtrans",
    holder: "Semua kanal yang aktif di akun toko",
    midtransPayments: [],
    group: "LAINNYA",
  },
];

export function getMidtransChannel(id: unknown): MidtransChannel | null {
  return MIDTRANS_CHANNELS.find((channel) => channel.id === id) ?? null;
}
