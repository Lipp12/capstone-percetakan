import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    orderId: string;
  };
}

export default async function CheckoutPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/checkout/${params.orderId}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      product: true,
      material: true,
      finishings: {
        include: { finishing: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  if (order.userId !== userId && userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Langkah 3 dari 3: Pembayaran
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Pembayaran & Konfirmasi Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Pesanan #{order.orderNumber} • Selesaikan pembayaran agar pesanan segera masuk ke antrean validasi desain.
        </p>
      </div>

      <CheckoutClient order={order} />
    </div>
  );
}
