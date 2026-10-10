import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PRODUCTION_AREA_STATUSES,
  evaluateProductionGate,
  productionGateMessage,
} from "@/lib/order-rules";

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

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "OPERATOR") {
      return NextResponse.json(
        { error: "Hanya Admin dan Operator yang dapat mengubah status pesanan" },
        { status: 403 }
      );
    }

    const orderId = params.id;
    const body = await req.json();
    const { status, notes, courier } = body as {
      status: string;
      notes?: string;
      courier?: string;
    };

    if (!status) {
      return NextResponse.json({ error: "Status wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        material: true,
        statusHistory: { select: { status: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const userName = session.user.name || "Admin";

    // GUARD ATURAN BISNIS (server-side, tidak bisa di-bypass via API):
    // Pesanan tidak boleh masuk area antrean produksi kecuali pembayaran
    // sudah lunas dan desain sudah di-ACC.
    const isProductionTarget = (PRODUCTION_AREA_STATUSES as readonly string[]).includes(
      status
    );

    if (isProductionTarget) {
      const historyStatuses = order.statusHistory.map((h) => h.status);

      // Kasus khusus target DESIGN_APPROVED: status ini sedang di-"assign"
      // oleh aksi approve itu sendiri, jadi desain belum tercatat di riwayat.
      // Yang wajib dipastikan di sini hanya lunas. Setelah update berhasil,
      // entri DESIGN_APPROVED masuk ke riwayat sehingga gate penuh berlaku
      // untuk semua tahap produksi berikutnya.
      if (status === "DESIGN_APPROVED") {
        const isPaid =
          historyStatuses.includes("PAID") || order.status === "PAID";

        if (!isPaid) {
          return NextResponse.json(
            {
              error:
                "Pesanan tidak bisa masuk area antrean produksi: pembayaran belum lunas. Konfirmasi pembayaran terlebih dahulu.",
            },
            { status: 409 }
          );
        }
      } else {
        const gate = evaluateProductionGate(order.status, historyStatuses);
        if (!gate.canEnterProduction) {
          return NextResponse.json(
            { error: productionGateMessage(gate) || "Persyaratan produksi belum terpenuhi." },
            { status: 409 }
          );
        }
      }
    }

    // PENCATATAN PENGGUNAAN BAHAN OTOMATIS:
    // Trigger saat status berubah ke IN_PRODUCTION
    if (status === "IN_PRODUCTION" && order.status !== "IN_PRODUCTION") {
      if (order.materialId) {
        const isM2 = order.product.unit.toLowerCase() === "m2";
        const area = isM2 ? (order.width || 1) * (order.height || 1) : 1;
        const requiredQuantity = Number((area * order.quantity).toFixed(2));

        // Catat ke MaterialUsage
        await prisma.materialUsage.create({
          data: {
            materialId: order.materialId,
            orderId: order.id,
            quantity: requiredQuantity,
            unit: order.material?.unit || order.product.unit,
          },
        });

        // Kurangi stok material
        await prisma.material.update({
          where: { id: order.materialId },
          data: {
            stock: {
              decrement: requiredQuantity,
            },
          },
        });
      }
    }

    // Susun catatan log status
    let statusNotes = notes || `Status diperbarui menjadi ${status}`;
    if (courier) {
      statusNotes += ` [Kurir: ${courier}]`;
    }

    // Update pesanan & buat history
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        designNotes: notes || order.designNotes,
        statusHistory: {
          create: {
            status,
            notes: statusNotes,
            changedBy: userName,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Status pesanan berhasil diperbarui",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui status pesanan" },
      { status: 500 }
    );
  }
}
