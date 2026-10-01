import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFileBuffer } from "@/lib/upload";

export const dynamic = "force-dynamic";

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
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const formData = await req.formData();
    const paymentMethod = formData.get("paymentMethod") as string;
    const proofFile = formData.get("proof") as File | null;

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Pilih metode pembayaran terlebih dahulu" },
        { status: 400 }
      );
    }

    let paymentProofUrl: string | null = order.paymentProofUrl;

    // Jika non-cash dan ada file bukti
    if (proofFile && proofFile.size > 0) {
      const fileBuffer = Buffer.from(await proofFile.arrayBuffer());
      paymentProofUrl = await uploadFileBuffer(fileBuffer, `payments/${orderId}`, proofFile.name, "image");
    }

    // Update status order ke PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        paymentProofUrl,
        status: "PAID",
        statusHistory: {
          create: {
            status: "PAID",
            notes: `Pembayaran dikonfirmasi via ${paymentMethod}`,
            changedBy: session.user.name || "Customer",
          },
        },
      },
    });

    // Catat ke transaksi keuangan
    await prisma.transaction.create({
      data: {
        type: "INCOME",
        category: "Order",
        item: `Pembayaran ${order.orderNumber} (${order.product.name})`,
        qty: 1,
        total: order.totalPrice,
        orderId: order.id,
        date: new Date(),
        notes: `Metode: ${paymentMethod}`,
      },
    });

    return NextResponse.json({
      message: "Pembayaran berhasil dikonfirmasi",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Pay order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pembayaran" },
      { status: 500 }
    );
  }
}
