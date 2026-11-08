import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderFormSchema } from "@/lib/validators";
import { calculatePricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// GET: Ambil daftar order
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const where: any = {};

    // Jika bukan admin/operator, hanya boleh lihat order milik sendiri
    if (userRole !== "ADMIN" && userRole !== "OPERATOR") {
      where.userId = userId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { product: { name: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        product: true,
        material: true,
        finishings: { include: { finishing: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET Orders error:", error);
    return NextResponse.json({ error: "Gagal memuat pesanan" }, { status: 500 });
  }
}

// POST: Buat pesanan baru
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu untuk membuat pesanan." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userName = session.user.name || "Customer";

    const body = await req.json();
    const validated = orderFormSchema.safeParse(body);

    if (!validated.success) {
      const err = validated.error.issues[0]?.message || "Input tidak valid";
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const {
      productId,
      materialId,
      width,
      height,
      quantity,
      pickupMethod,
      address,
      finishingIds = [],
      notes,
    } = validated.data;

    // Ambil data produk & material
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        materials: {
          include: { material: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    let materialAdditionalPrice = 0;
    if (materialId) {
      const prodMat = product.materials.find((pm) => pm.materialId === materialId);
      if (prodMat) {
        materialAdditionalPrice = prodMat.additionalPrice;
      }
    }

    // Ambil data finishing
    let selectedFinishings: any[] = [];
    if (finishingIds.length > 0) {
      selectedFinishings = await prisma.finishing.findMany({
        where: { id: { in: finishingIds } },
      });
    }

    // Hitung ulang harga di sisi server demi integritas data
    const pricing = calculatePricing({
      basePrice: product.basePrice,
      unit: product.unit,
      materialAdditionalPrice,
      width,
      height,
      quantity,
      finishings: selectedFinishings.map((f) => ({
        id: f.id,
        name: f.name,
        price: f.price,
        unit: f.unit,
      })),
    });

    // Generate Order Number unik (ORD-YYYYMMDD-XXXX)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `ORD-${todayStr}-${randomHex}`;

    // Simpan Order ke Database
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        productId,
        materialId: materialId || null,
        width: product.unit.toLowerCase() === "m2" ? width : null,
        height: product.unit.toLowerCase() === "m2" ? height : null,
        quantity,
        pickupMethod,
        address: pickupMethod === "DELIVERY" ? address : null,
        totalPrice: pricing.total,
        status: "PENDING_PAYMENT",
        notes: notes || null,
        statusHistory: {
          create: {
            status: "PENDING_PAYMENT",
            notes: "Pesanan berhasil dibuat oleh pelanggan",
            changedBy: userName,
          },
        },
        finishings: {
          create: pricing.finishingsBreakdown.map((fin) => {
            const match = selectedFinishings.find((sf) => sf.name === fin.name);
            return {
              finishingId: match ? match.id : finishingIds[0],
              price: fin.total,
            };
          }),
        },
      },
    });

    return NextResponse.json({
      message: "Pesanan berhasil dibuat",
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error("Create Order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesanan" },
      { status: 500 }
    );
  }
}
