import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description, category, basePrice, unit, imageUrl } = body;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(category && { category }),
        ...(basePrice && { basePrice: Number(basePrice) }),
        ...(unit && { unit }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? imageUrl : null }),
      },
    });

    return NextResponse.json({ message: "Produk berhasil diperbarui", product: updated });
  } catch (error) {
    console.error("PUT Product error:", error);
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Product error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
