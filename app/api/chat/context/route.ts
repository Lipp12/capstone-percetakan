import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = req.nextUrl.searchParams.get("orderId");
  const productId = req.nextUrl.searchParams.get("productId");

  try {
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: (session.user as any).id,
        },
        include: {
          product: true,
          material: true,
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json({
        type: "order",
        id: order.id,
        orderNumber: order.orderNumber,
        productName: order.product.name,
        productImage: order.product.imageUrl,
        materialName: order.material?.name,
        quantity: order.quantity,
        unit: order.product.unit,
        width: order.width,
        height: order.height,
        totalPrice: order.totalPrice,
        status: order.status,
        detailUrl: `/orders/${order.id}/tracking`,
      });
    }

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { materials: { include: { material: true } } },
      });

      if (!product) {
        return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json({
        type: "product",
        id: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        materialName: product.materials?.[0]?.material.name,
        quantity: null,
        unit: product.unit,
        width: null,
        height: null,
        basePrice: product.basePrice,
        detailUrl: `/order/${product.id}`,
      });
    }

    return NextResponse.json({ type: null });
  } catch (error) {
    console.error("[Chat Context Error]:", error);
    return NextResponse.json({ error: "Gagal memuat konteks chat" }, { status: 500 });
  }
}
