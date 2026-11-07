import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating minimal 1 bintang").max(5, "Rating maksimal 5 bintang"),
  comment: z.string().max(1000, "Ulasan maksimal 1000 karakter").optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Gunakan prisma.review jika sudah dikenali runtime, atau fallback ke query SQL
    if ((prisma as any).review) {
      const review = await (prisma as any).review.findUnique({
        where: { orderId: params.id },
        include: {
          user: { select: { name: true, email: true } },
        },
      });
      return NextResponse.json({ review });
    }

    const rows: any[] = await prisma.$queryRaw`
      SELECT r.*, u.name as "userName", u.email as "userEmail"
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r."orderId" = ${params.id}
      LIMIT 1;
    `;

    const review =
      rows.length > 0
        ? {
            ...rows[0],
            user: { name: rows[0].userName, email: rows[0].userEmail },
          }
        : null;

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("[Review GET Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil data ulasan" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Validasi khusus akun pelanggan
    if (userRole !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Fitur pemberian ulasan hanya dapat diakses oleh akun Pelanggan." },
        { status: 403 }
      );
    }

    // Ambil data pesanan
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan pesanan adalah milik pelanggan yang sedang login
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda hanya dapat memberi ulasan pada pesanan milik Anda sendiri." },
        { status: 403 }
      );
    }

    // Validasi status pesanan: hanya pesanan yang sudah COMPLETED (selesai) yang dapat diulas
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "Ulasan hanya dapat diberikan untuk pesanan yang statusnya sudah Selesai (COMPLETED).",
        },
        { status: 400 }
      );
    }

    // Validasi payload (rating & komentar)
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data ulasan tidak valid." },
        { status: 400 }
      );
    }

    const { rating, comment } = parsed.data;
    const cleanComment = comment?.trim() || null;

    let review: any;

    if ((prisma as any).review) {
      // Jalur ORM Prisma jika runtime model sudah ter-refresh
      review = await (prisma as any).review.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          userId: order.userId,
          productId: order.productId,
          rating,
          comment: cleanComment,
        },
        update: {
          rating,
          comment: cleanComment,
        },
      });
    } else {
      // Fallback SQL langsung ke PostgreSQL (kebal terhadap caching node_modules di Next.js dev server)
      const newId = "rev_" + randomUUID().replace(/-/g, "").slice(0, 20);
      const rows: any[] = await prisma.$queryRaw`
        INSERT INTO "Review" ("id", "orderId", "userId", "productId", "rating", "comment", "createdAt", "updatedAt")
        VALUES (${newId}, ${order.id}, ${order.userId}, ${order.productId}, ${rating}, ${cleanComment}, NOW(), NOW())
        ON CONFLICT ("orderId")
        DO UPDATE SET "rating" = ${rating}, "comment" = ${cleanComment}, "updatedAt" = NOW()
        RETURNING *;
      `;
      review = rows[0];
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Ulasan Anda telah berhasil disimpan.",
      data: review,
    });
  } catch (error: any) {
    console.error("[Review POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat menyimpan ulasan." },
      { status: 500 }
    );
  }
}
