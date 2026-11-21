import { prisma } from "@/lib/prisma";

/**
 * Satu tempat untuk "melunasi" pesanan, dipakai oleh webhook Midtrans,
 * pengecekan status, dan metode manual (fallback).
 *
 * Sifat penting:
 * - Idempoten: kalau sudah ada riwayat PAID, tidak menulis ulang / tidak
 *   membuat transaksi keuangan dobel meski webhook Midtrans dikirim 2x.
 * - Otomatis lanjut ke step berikutnya: PAID -> DESIGN_CHECKING (kalau file
 *   desain sudah diunggah). Entri PAID tetap tersimpan di statusHistory karena
 *   lib/order-rules.ts memakainya sebagai bukti lunas untuk masuk produksi.
 */

const PRE_DESIGN_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "DESIGN_CHECKING",
  "DESIGN_REJECTED",
];

export type MarkPaidInput = {
  orderId: string;
  /** Label metode, mis. "Midtrans (bank_transfer)" atau "Transfer BCA". */
  methodLabel: string;
  /** Nomor referensi transaksi gateway (opsional untuk manual). */
  reference?: string;
  /** Catatan tambahan untuk riwayat status. */
  note?: string;
  changedBy?: string;
  /** Dipakai untuk memastikan jumlah yang dibayar sesuai tagihan. */
  amount?: string | number | null;
};

export type MarkPaidResult =
  | { processed: true; orderStatus: string }
  | {
      processed: false;
      reason: "not_found" | "already_paid" | "amount_mismatch";
      orderStatus?: string;
    };

export async function markOrderPaid(input: MarkPaidInput): Promise<MarkPaidResult> {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { statusHistory: true, product: true },
  });

  if (!order) return { processed: false, reason: "not_found" };

  // Webhook bisa dikirim ulang -> jangan catat PAID / income dua kali.
  const alreadyPaid = order.statusHistory.find((history) => history.status === "PAID");
  if (alreadyPaid) {
    return { processed: false, reason: "already_paid", orderStatus: order.status };
  }

  if (input.amount !== undefined && input.amount !== null && input.amount !== "") {
    const paidAmount = Number(input.amount);
    if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.totalPrice) > 1) {
      return { processed: false, reason: "amount_mismatch", orderStatus: order.status };
    }
  }

  const reference = input.reference ? ` (Ref: ${input.reference})` : "";
  const paidNote = [
    `Pembayaran lunas via ${input.methodLabel}${reference}.`,
    input.note,
  ]
    .filter(Boolean)
    .join(" ");

  // Step berikutnya setelah lunas: pengecekan desain.
  // Kalau desain belum diunggah, biarkan di PAID sampai pelanggan upload.
  const nextStatus = PRE_DESIGN_STATUSES.includes(order.status)
    ? order.designFileUrl
      ? "DESIGN_CHECKING"
      : "PAID"
    : order.status;

  const statusHistoryCreate: Array<{
    status: string;
    notes: string;
    changedBy: string;
  }> = [
    {
      status: "PAID",
      notes: paidNote,
      changedBy: input.changedBy || "Sistem",
    },
  ];

  if (nextStatus === "DESIGN_CHECKING") {
    statusHistoryCreate.push({
      status: "DESIGN_CHECKING",
      notes: "Pembayaran dikonfirmasi. Desain otomatis masuk antrean pengecekan.",
      changedBy: "Sistem",
    });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        paymentMethod: input.methodLabel.toUpperCase(),
        statusHistory: { create: statusHistoryCreate },
      },
    }),
    prisma.transaction.create({
      data: {
        type: "INCOME",
        category: "Order",
        item: `Pembayaran ${order.orderNumber} (${order.product.name})`,
        qty: 1,
        total: order.totalPrice,
        orderId: order.id,
        date: new Date(),
        notes: `${input.methodLabel}${reference}`,
      },
    }),
  ]);

  return { processed: true, orderStatus: nextStatus };
}
