import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        materials: { include: { material: true } },
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET Products error:", error);
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
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
    const validated = productSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: validated.data,
    });

    return NextResponse.json({ message: "Produk berhasil dibuat", product });
  } catch (error) {
    console.error("POST Product error:", error);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
