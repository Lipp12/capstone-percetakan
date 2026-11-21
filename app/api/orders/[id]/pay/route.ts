import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction, MidtransRequestError } from "@/lib/midtrans";
import { getMidtransChannel } from "@/lib/midtrans-channels";

export const dynamic = "force-dynamic";

const PAID_STATUSES = [
  "PAID",
  "DESIGN_APPROVED",
  "IN_PRODUCTION",
  "FINISHING",
  "READY",
  "SHIPPING",
  "COMPLETED",
];

/**
 * POST /api/orders/:id/pay
 * Body: { method: "MIDTRANS", channel: id dari lib/midtrans-channels.ts }
 *
 * Semua saluran pembayaran di checkout dijalankan oleh Midtrans Snap.
 * dananya masuk ke akun merchant toko (settlement BRI / GoPay di MAP).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true, user: true, statusHistory: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "OPERATOR" && order.userId !== userId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    if (
      PAID_STATUSES.includes(order.status) ||
      order.statusHistory.some((history) => history.status === "PAID")
    ) {
      return NextResponse.json({
        alreadyPaid: true,
        message: "Pembayaran pesanan ini sudah tercatat.",
        orderStatus: order.status,
      });
    }

    const body = await req.json().catch(() => ({}));
    if (body?.method && body.method !== "MIDTRANS") {
      return NextResponse.json(
        { error: "Metode pembayaran tidak dikenali" },
        { status: 400 }
      );
    }

    const channel = getMidtransChannel(body?.channel || "ALL");
    if (!channel) {
      return NextResponse.json(
        { error: "Saluran pembayaran tidak dikenali" },
        { status: 400 }
      );
    }

    const snap = await createSnapTransaction({
      orderId: order.id,
      orderNumber: order.orderNumber,
      grossAmount: order.totalPrice,
      productName: order.product.name,
      customer: {
        name: session.user.name || order.user.name || "Pelanggan",
        email: session.user.email || order.user.email,
        phone: order.user.phone,
      },
      enabledPayments: channel.midtransPayments,
      // Pakai origin request supaya callback finish/pending/error tetap benar
      // walaupun NEXT_PUBLIC_SITE_URL belum diisi.
      siteUrl: req.nextUrl.origin,
    });

    return NextResponse.json({
      message: `Token Midtrans untuk ${channel.name} berhasil dibuat`,
      channel: channel.id,
      ...snap,
    });
  } catch (error) {
    if (error instanceof MidtransRequestError) {
      console.error("Midtrans Snap error:", error.message, error.details ?? "");
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Pay order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pembayaran" },
      { status: 500 }
    );
  }
}
