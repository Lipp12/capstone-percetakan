import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTransactionStatus,
  isSuccessfulPayment,
  MidtransRequestError,
  verifyNotificationSignature,
  type MidtransNotificationPayload,
} from "@/lib/midtrans";
import { markOrderPaid } from "@/lib/payment-fulfillment";

export const dynamic = "force-dynamic";

/**
 * Webhook / HTTP Notification dari Midtrans.
 * URL ini harus dipasang di Midtrans MAP:
 * Settings > Configuration > Payment Notification URL
 *   https://<domain>/api/payments/notification
 *
 * Route ini sengaja TIDak memakai session (dipanggil Midtrans, bukan browser).
 */
export async function POST(req: NextRequest) {
  let payload: MidtransNotificationPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.order_id || !payload?.signature_key) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }

  // 1. Verifikasi tanda tangan SEBELUM mempercayai isi notifikasi.
  if (!verifyNotificationSignature(payload)) {
    console.warn("Midtrans notification rejected: invalid signature", payload.order_id);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Challenge response: tanya langsung ke Midtrans. Kalau gagal (misalnya
  //    status belum tersedia), tetap gunakan data notifikasi yang sudah
  //    terverifikasi tanda tangannya.
  let statusPayload: MidtransNotificationPayload = payload;
  try {
    statusPayload = await getTransactionStatus(String(payload.order_id));
  } catch (error) {
    if (!(error instanceof MidtransRequestError)) throw error;
    console.warn(
      "Midtrans status challenge failed, using notification payload:",
      error.message
    );
  }

  // 3. Abaikan status pending/expire/cancel/deny. Jangan pernah menimpa
  //    status lunas dengan notifikasi yang terlambat (out-of-order).
  if (!isSuccessfulPayment(statusPayload)) {
    return NextResponse.json({
      received: true,
      paid: false,
      transactionStatus: statusPayload.transaction_status || "unknown",
    });
  }

  const orderId = String(statusPayload.order_id || payload.order_id);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    console.warn("Midtrans notification for unknown order:", orderId);
    return NextResponse.json({ received: true, paid: false, reason: "order_not_found" });
  }

  const result = await markOrderPaid({
    orderId: order.id,
    methodLabel: `Midtrans (${statusPayload.payment_type || payload.payment_type || "payment"})`,
    reference:
      statusPayload.transaction_id ||
      String(payload.transaction_id || "") ||
      undefined,
    note: "Status pembayaran diverifikasi dari notifikasi Midtrans.",
    changedBy: "Midtrans Webhook",
    amount: statusPayload.gross_amount ?? payload.gross_amount,
  });

  // Balas 200 dengan cepat agar Midtrans tidak retry.
  return NextResponse.json({
    received: true,
    paid: result.processed || result.reason === "already_paid",
    orderStatus: result.orderStatus,
    reason: result.processed ? undefined : result.reason,
  });
}
