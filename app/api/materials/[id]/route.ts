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
    if (role !== "ADMIN" && role !== "OPERATOR") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, pricePerUnit, unit, stock, minStock, addStock } = body;

    const existing = await prisma.material.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Material tidak ditemukan" }, { status: 404 });
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (pricePerUnit !== undefined) updatedData.pricePerUnit = Number(pricePerUnit);
    if (unit !== undefined) updatedData.unit = unit;
    if (minStock !== undefined) updatedData.minStock = Number(minStock);

    if (addStock !== undefined && Number(addStock) > 0) {
      updatedData.stock = { increment: Number(addStock) };
    } else if (stock !== undefined) {
      updatedData.stock = Number(stock);
    }

    const updated = await prisma.material.update({
      where: { id: params.id },
      data: updatedData,
    });

    return NextResponse.json({ message: "Material berhasil diperbarui", material: updated });
  } catch (error) {
    console.error("PUT Material error:", error);
    return NextResponse.json({ error: "Gagal memperbarui material" }, { status: 500 });
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

    await prisma.material.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Material berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Material error:", error);
    return NextResponse.json({ error: "Gagal menghapus material" }, { status: 500 });
  }
}
