import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncOrderToAlif } from "@/lib/api-alif";

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
    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true, product: true, material: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const alifForm = new FormData();
    alifForm.append("order_id", order.id);
    alifForm.append("order_number", order.orderNumber);
    alifForm.append("customer_name", order.user.name);
    alifForm.append("customer_email", order.user.email);
    alifForm.append("customer_phone", order.user.phone || "");
    alifForm.append("product_name", order.product.name);
    alifForm.append("product_slug", order.product.slug);
    alifForm.append("material", order.material?.name || "");
    alifForm.append("quantity", String(order.quantity));
    alifForm.append("total_price", String(order.totalPrice));
    alifForm.append("notes", order.notes || "");
    if (order.designFileUrl) alifForm.append("design_file_url", order.designFileUrl);

    const result = await syncOrderToAlif(alifForm);
    let status: string;
    let error: string | null;
    if (result.mock) {
      status = "PENDING";
      error = null;
    } else {
      status = result.ok ? "SYNCED" : "FAILED";
      error = result.ok ? null : result.error || "Gagal sinkron ke API Alif";
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { alifSyncStatus: status, alifSyncError: error },
    });

    return NextResponse.json({
      ok: result.ok,
      alifSyncStatus: status,
      error,
      mock: result.mock,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal sinkron ke API Alif" },
      { status: 500 }
    );
  }
}