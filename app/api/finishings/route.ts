import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finishingSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const finishings = await prisma.finishing.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ finishings });
  } catch (error) {
    console.error("GET Finishings error:", error);
    return NextResponse.json({ error: "Gagal memuat finishing" }, { status: 500 });
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
    const validated = finishingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const finishing = await prisma.finishing.create({
      data: validated.data,
    });

    return NextResponse.json({ message: "Finishing berhasil dibuat", finishing });
  } catch (error) {
    console.error("POST Finishing error:", error);
    return NextResponse.json({ error: "Gagal membuat finishing" }, { status: 500 });
  }
}
