// lib/order-rules.ts
// Aturan bisnis produksi percetakan: sebuah pesanan TIDAK BOLEH masuk area
// antrean produksi kecuali pembayaran sudah lunas dan desain sudah di-ACC.

/**
 * Status yang menandakan desain sudah disetujui (di-ACC).
 * Status ini SESUNGGUHNYA berarti "punya desain sudah ACC", bukan "sudah bayar".
 */
export const DESIGN_APPROVED_STATUSES = [
  "DESIGN_APPROVED",
  "IN_PRODUCTION",
  "FINISHING",
  "READY",
  "SHIPPING",
  "COMPLETED",
] as const;

/** Semua status yang berada di dalam area antrean produksi (Kanban board). */
export const PRODUCTION_AREA_STATUSES = [
  "DESIGN_APPROVED",
  "IN_PRODUCTION",
  "FINISHING",
  "READY",
  "SHIPPING",
  "COMPLETED",
] as const;

export type ProductionGate = {
  isPaymentPaid: boolean;
  isDesignApproved: boolean;
  canEnterProduction: boolean;
};

/**
 * Menentukan apakah pesanan sudah lunas dan desainnya sudah di-ACC.
 *
 * PENTING: karena `order.status` hanya menyimpan SATU status terakhir, status
 * seperti `DESIGN_APPROVED` TIDAK membuktikan pembayaran — status itu bisa
 * di-"assign" langsung tanpa pernah bayar. Satu-satunya bukti lunas yang
 * sah adalah entri `PAID` di `statusHistory`, karena route pembayaran
 * (/api/orders/[id]/pay) selalu mencatatnya.
 *
 * @param currentStatus Status terakhir pada kolom `order.status`
 * @param historyStatuses Semua status dari `order.statusHistory`
 */
export function evaluateProductionGate(
  currentStatus: string,
  historyStatuses: readonly string[]
): ProductionGate {
  // Bukti lunas: entri PAID eksplisit di riwayat (fallback: status saat ini PAID
  // untuk order lama yang riwayatnya tidak lengkap).
  const isPaymentPaid =
    historyStatuses.includes("PAID") || currentStatus === "PAID";

  // Bukti ACC: status saat ini sudah melewati tahap desain, ATAU riwayat
  // pernah mencatat DESIGN_APPROVED.
  const isDesignApproved =
    (DESIGN_APPROVED_STATUSES as readonly string[]).includes(currentStatus) ||
    historyStatuses.includes("DESIGN_APPROVED");

  return {
    isPaymentPaid,
    isDesignApproved,
    canEnterProduction: isPaymentPaid && isDesignApproved,
  };
}

/** Pesan error siap tampil sesuai bagian yang belum terpenuhi. */
export function productionGateMessage(gate: ProductionGate): string | null {
  const problems: string[] = [];
  if (!gate.isPaymentPaid) problems.push("pembayaran belum lunas");
  if (!gate.isDesignApproved) problems.push("desain belum disetujui (ACC)");
  if (problems.length === 0) return null;
  return `Pesanan tidak bisa masuk area antrean produksi: ${problems.join(
    " dan "
  )}. ${!gate.isPaymentPaid ? "Konfirmasi pembayaran terlebih dahulu. " : ""}${
    !gate.isDesignApproved ? "Validasi desain terlebih dahulu." : ""
  }`.trim();
}
