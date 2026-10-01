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
    const { name, price, unit } = body;

    const updated = await prisma.finishing.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(price && { price: Number(price) }),
        ...(unit && { unit }),
      },
    });

    return NextResponse.json({ message: "Finishing berhasil diperbarui", finishing: updated });
  } catch (error) {
    console.error("PUT Finishing error:", error);
    return NextResponse.json({ error: "Gagal memperbarui finishing" }, { status: 500 });
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

    await prisma.finishing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Finishing berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Finishing error:", error);
    return NextResponse.json({ error: "Gagal menghapus finishing" }, { status: 500 });
  }
}
