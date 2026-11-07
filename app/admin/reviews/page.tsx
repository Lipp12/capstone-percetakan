import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rekap Ulasan Pelanggan - Admin Percetakan",
};

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/reviews");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect("/dashboard");
  }

  let reviews: any[] = [];
  try {
    if ((prisma as any).review) {
      reviews = await (prisma as any).review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
          order: { select: { id: true, orderNumber: true, totalPrice: true, createdAt: true } },
        },
      });
    } else {
      // Fallback SQL query langsung ke tabel Review
      const rows: any[] = await prisma.$queryRaw`
        SELECT 
          r."id", r."orderId", r."userId", r."productId", r."rating", r."comment", r."createdAt",
          u."name" as "userName", u."email" as "userEmail", u."phone" as "userPhone",
          p."name" as "prodName", p."slug" as "prodSlug", p."imageUrl" as "prodImage",
          o."orderNumber" as "ordNumber", o."totalPrice" as "ordPrice", o."createdAt" as "ordCreatedAt"
        FROM "Review" r
        JOIN "User" u ON r."userId" = u."id"
        JOIN "Product" p ON r."productId" = p."id"
        JOIN "Order" o ON r."orderId" = o."id"
        ORDER BY r."createdAt" DESC;
      `;

      reviews = rows.map((row) => ({
        id: row.id,
        orderId: row.orderId,
        userId: row.userId,
        productId: row.productId,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt,
        user: { id: row.userId, name: row.userName, email: row.userEmail, phone: row.userPhone },
        product: { id: row.productId, name: row.prodName, slug: row.prodSlug, imageUrl: row.prodImage },
        order: { id: row.orderId, orderNumber: row.ordNumber, totalPrice: row.ordPrice, createdAt: row.ordCreatedAt },
      }));
    }
  } catch (err) {
    console.warn("[AdminReviewsPage] Belum dapat memuat data ulasan:", err);
  }

  return <ReviewsClient initialReviews={reviews} />;
}
