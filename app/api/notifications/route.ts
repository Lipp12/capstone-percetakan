import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ notifications: [] });
    }

    const userId = (session.user as any).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        updatedAt: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { notes: true },
        },
      },
    });

    const notifications = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      notes: o.statusHistory[0]?.notes || undefined,
      updatedAt: o.updatedAt.toISOString(),
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}
