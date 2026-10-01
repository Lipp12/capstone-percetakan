import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { materialSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lowStock = searchParams.get("lowStock") === "true";

    let materials = await prisma.material.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true, usages: true } },
      },
    });

    if (lowStock) {
      materials = materials.filter((m) => m.stock < m.minStock);
    }

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("GET Materials error:", error);
    return NextResponse.json({ error: "Gagal memuat material" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const validated = materialSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: validated.data,
    });

    return NextResponse.json({ message: "Material berhasil dibuat", material });
  } catch (error) {
    console.error("POST Material error:", error);
    return NextResponse.json({ error: "Gagal membuat material" }, { status: 500 });
  }
}
