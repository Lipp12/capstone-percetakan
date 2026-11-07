import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import OrderReviewCard from "@/components/OrderReviewCard";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function OrderReviewPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/orders/${params.id}/review`);
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // Hanya pelanggan yang boleh mengakses
  if (userRole !== "CUSTOMER") {
    redirect("/dashboard");
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      material: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Validasi kepemilikan pesanan
  if (order.userId !== userId) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Ditolak</h2>
        <p className="text-sm text-slate-500">
          Anda hanya dapat memberi ulasan pada pesanan milik Anda sendiri.
        </p>
        <Link
          href="/orders"
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Kembali ke Pesanan Saya
        </Link>
      </div>
    );
  }

  // Validasi status: hanya pesanan COMPLETED yang dapat diulas
  if (order.status !== "COMPLETED") {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Pesanan Belum Selesai</h2>
        <p className="text-sm text-slate-500">
          Ulasan hanya dapat diberikan setelah pesanan Anda berstatus <strong>Selesai (COMPLETED)</strong>.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href={`/orders/${order.id}/tracking`}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Lihat Tracking Pesanan
          </Link>
          <Link
            href="/orders"
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
          >
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  // Ambil data ulasan jika sudah ada
  let existingReview: any = null;
  try {
    if ((prisma as any).review) {
      existingReview = await (prisma as any).review.findUnique({
        where: { orderId: order.id },
      });
    } else {
      const rows: any[] = await prisma.$queryRaw`
        SELECT * FROM "Review" WHERE "orderId" = ${order.id} LIMIT 1;
      `;
      existingReview = rows.length > 0 ? rows[0] : null;
    }
  } catch (err) {
    console.warn("[OrderReviewPage] Belum dapat memuat review:", err);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Riwayat Pesanan</span>
      </Link>

      <OrderReviewCard
        orderId={order.id}
        orderNumber={order.orderNumber}
        productName={order.product.name}
        orderStatus={order.status}
        existingReview={existingReview}
      />
    </div>
  );
}
