import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UploadDesignForm from "@/components/UploadDesignForm";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, FileUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string; // orderId
  };
}

export default async function UploadDesignPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
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

  // Pastikan order milik user yang login (kecuali admin)
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  if (order.userId !== userId && userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/orders`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pesanan</span>
        </Link>
        <span className="text-xs font-semibold text-slate-400">
          Langkah 2 dari 3: Unggah Desain
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-2">
            <FileUp className="w-3.5 h-3.5" />
            <span>Unggah File Siap Cetak</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Unggah Desain: {order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Produk: <span className="font-semibold text-slate-800">{order.product.name}</span>
            {order.material ? ` • Bahan: ${order.material.name}` : ""}
            {order.width && order.height ? ` • ${order.width}x${order.height}m` : ""}
            {" • "}Total Tagihan:{" "}
            <span className="font-bold text-blue-600">{formatRupiah(order.totalPrice)}</span>
          </p>
        </div>

        {/* Form Upload */}
        <UploadDesignForm
          orderId={order.id}
          orderNumber={order.orderNumber}
          existingFileUrl={order.designFileUrl}
        />
      </div>
    </div>
  );
}
