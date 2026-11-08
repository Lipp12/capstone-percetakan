import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderFormSchema } from "@/lib/validators";
import { calculatePricing } from "@/lib/pricing";
import { uploadFileBuffer } from "@/lib/upload";
import { syncOrderToAlif } from "@/lib/api-alif";

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

    const contentType = req.headers.get("content-type") || "";
    let rawBody: any = {};
    let uploadedFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      uploadedFile = (formData.get("file") as File | null) || null;
      let finishingIds: string[] = [];
      const finishingRaw = formData.get("finishingIds");
      if (typeof finishingRaw === "string" && finishingRaw.trim()) {
        try {
          finishingIds = JSON.parse(finishingRaw);
        } catch {
          finishingIds = finishingRaw.split(",").map((s) => s.trim()).filter(Boolean);
        }
      } else if (formData.getAll("finishingIds").length) {
        finishingIds = formData.getAll("finishingIds").map((v) => String(v));
      }

      rawBody = {
        productId: formData.get("productId"),
        materialId: formData.get("materialId") || undefined,
        width: formData.get("width") ? Number(formData.get("width")) : undefined,
        height: formData.get("height") ? Number(formData.get("height")) : undefined,
        quantity: formData.get("quantity") ? Number(formData.get("quantity")) : undefined,
        pickupMethod: formData.get("pickupMethod"),
        address: formData.get("address") || undefined,
        finishingIds,
        notes: formData.get("notes") || undefined,
      };
    } else {
      rawBody = await req.json();
    }

    const validated = orderFormSchema.safeParse(rawBody);

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

    // Upload berkas desain (jika ada) sebelum menyimpan order
    let designFileUrl: string | null = null;
    if (uploadedFile && uploadedFile.size > 0) {
      const buffer = Buffer.from(await uploadedFile.arrayBuffer());
      designFileUrl = await uploadFileBuffer(
        buffer,
        "designs",
        uploadedFile.name,
        "auto"
      );
    }

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
        designFileUrl,
        notes: notes || null,
        alifSyncStatus: "PENDING",
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

    // Teruskan ke API Alif (best-effort; jangan gagalkan pembuatan order)
    let alifSyncStatus = "PENDING";
    let alifSyncError: string | null = null;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const alifForm = new FormData();
      alifForm.append("order_id", newOrder.id);
      alifForm.append("order_number", newOrder.orderNumber);
      alifForm.append("customer_name", user?.name || userName);
      alifForm.append("customer_email", user?.email || "");
      alifForm.append("customer_phone", user?.phone || "");
      alifForm.append("product_name", product.name);
      alifForm.append("product_slug", product.slug);
      alifForm.append("material", materialId || "");
      alifForm.append("quantity", String(quantity));
      alifForm.append("total_price", String(pricing.total));
      alifForm.append("notes", notes || "");
      if (designFileUrl) alifForm.append("design_file_url", designFileUrl);
      if (uploadedFile && uploadedFile.size > 0) {
        alifForm.append("file", uploadedFile, uploadedFile.name);
      }

      const syncResult = await syncOrderToAlif(alifForm);
      if (syncResult.mock) {
        // Variabel API Alif belum diisi: pesanan tetap disimpan, ditandai belum terkirim.
        alifSyncStatus = "PENDING";
        alifSyncError = null;
      } else {
        alifSyncStatus = syncResult.ok ? "SYNCED" : "FAILED";
        alifSyncError = syncResult.ok ? null : syncResult.error || "Gagal sinkron ke API Alif";
      }
    } catch (syncErr: any) {
      alifSyncStatus = "FAILED";
      alifSyncError = syncErr?.message || "Gagal sinkron ke API Alif";
    }

    await prisma.order.update({
      where: { id: newOrder.id },
      data: { alifSyncStatus, alifSyncError },
    });

    return NextResponse.json({
      message: "Pesanan berhasil dibuat",
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      alifSyncStatus,
    });
  } catch (error) {
    console.error("Create Order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesanan" },
      { status: 500 }
    );
  }
}
