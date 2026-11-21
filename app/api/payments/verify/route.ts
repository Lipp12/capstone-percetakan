import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getTransactionStatus,
  isSuccessfulPayment,
  MidtransRequestError,
} from "@/lib/midtrans";
import { markOrderPaid } from "@/lib/payment-fulfillment";

export const dynamic = "force-dynamic";

/**
 * Dipanggil browser setelah popup Snap onSuccess/onPending, dan oleh
 * PaymentStatusRefresher di halaman tracking.
 *
 * Frontend TIDAK pernah dipercaya untuk menentukan lunas: status selalu
 * diambil langsung dari Midtrans GET Status API.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "");
    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { statusHistory: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "OPERATOR" && order.userId !== userId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const alreadyPaid = order.statusHistory.some(
      (history) => history.status === "PAID"
    );
    if (alreadyPaid) {
      return NextResponse.json({
        paid: true,
        orderStatus: order.status,
        alreadyPaid: true,
      });
    }

    let statusPayload;
    try {
      statusPayload = await getTransactionStatus(order.id);
    } catch (error) {
      if (error instanceof MidtransRequestError && error.status === 404) {
        // Snap belum dipilih metodenya oleh pelanggan.
        return NextResponse.json({
          paid: false,
          transactionStatus: "not_found",
          orderStatus: order.status,
          message: "Metode pembayaran belum dipilih di halaman Midtrans.",
        });
      }
      throw error;
    }

    if (!isSuccessfulPayment(statusPayload)) {
      return NextResponse.json({
        paid: false,
        transactionStatus: statusPayload.transaction_status || "unknown",
        orderStatus: order.status,
        message: "Pembayaran belum lunas menurut Midtrans.",
      });
    }

    const result = await markOrderPaid({
      orderId: order.id,
      methodLabel: `Midtrans (${statusPayload.payment_type || "payment"})`,
      reference: statusPayload.transaction_id,
      note: "Status pembayaran diverifikasi langsung melalui Midtrans Get Status API.",
      changedBy: "Midtrans Status Check",
      amount: statusPayload.gross_amount,
    });

    if (!result.processed && result.reason === "amount_mismatch") {
      return NextResponse.json(
        {
          paid: false,
          reason: "amount_mismatch",
          orderStatus: order.status,
          message: "Jumlah pembayaran tidak sesuai tagihan.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      paid: true,
      orderStatus: result.orderStatus,
      transactionStatus: statusPayload.transaction_status,
    });
  } catch (error) {
    console.error("Verify Midtrans payment error:", error);
    const message =
      error instanceof MidtransRequestError
        ? error.message
        : "Gagal memverifikasi pembayaran";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
