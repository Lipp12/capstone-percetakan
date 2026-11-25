import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import PrintInvoiceButton from "@/components/PrintInvoiceButton";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function InvoicePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/orders/${params.id}/invoice`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      material: true,
      finishings: { include: { finishing: true } },
      user: { select: { name: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const userId = (session.user as any)?.id;
  const role = (session.user as any)?.role;
  if (role !== "ADMIN" && role !== "OPERATOR" && order.userId !== userId) {
    redirect("/dashboard");
  }

  const finishingsTotal = order.finishings.reduce(
    (total, finishing) => total + finishing.price,
    0
  );
  const productSubtotal = Math.max(0, order.totalPrice - finishingsTotal);
  const billingQuantity =
    order.quantity *
    (order.product.unit.toLowerCase() === "m2"
      ? Math.max(0.1, (order.width ?? 1) * (order.height ?? 1))
      : 1);
  const productUnitPrice =
    billingQuantity > 0 ? Math.round(productSubtotal / billingQuantity) : 0;

  return (
    <div className="invoice-page mx-auto w-full max-w-[210mm] space-y-4">
      {/* Invoice document */}
      <article className="invoice-paper w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg shadow-surface-container/30">
          {/* Receipt header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-7 border-b border-dashed border-surface-container-high p-6">
            <div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-2xl font-black text-on-surface">Faeyza</span>
                <span className="text-2xl font-black text-primary ml-0.5">Printing</span>
              </div>
              <div className="mt-2 text-xs text-on-surface-variant space-y-0.5 max-w-sm leading-relaxed">
                <p className="font-medium text-on-surface">Jl. Pawon Raya Jl. Harapankita No.22A, Bencongan, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten 15810</p>
                <p>Buka Setiap Hari: 10:00 - 20:00 WIB</p>
              </div>
            </div>
            <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto">
              <div>
                <h1 className="text-2xl font-black tracking-wider text-on-surface uppercase">INVOICE</h1>
                <p className="text-xs font-semibold text-on-surface-variant mt-1 font-mono">#{order.orderNumber}</p>
                <p className="text-xs text-on-surface-variant">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-black tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {order.status === "COMPLETED"
                    ? "LUNAS"
                    : order.status === "PENDING_PAYMENT"
                      ? "Menunggu Pembayaran"
                      : order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Order Meta */}
          <div className="grid grid-cols-1 gap-5 py-6 border-b border-dashed border-surface-container-high text-xs px-6">
            <div>
              <div className="uppercase tracking-wider font-bold text-outline text-[10px] mb-1">Pelanggan</div>
              <div className="font-bold text-on-surface text-sm">{order.user?.name || "-"}</div>
            </div>
            <div>
              <div className="uppercase tracking-wider font-bold text-outline text-[10px] mb-1">Pengambilan</div>
              <div className="font-bold text-on-surface text-sm">
                {order.pickupMethod === "DELIVERY" ? "Kurir Pengiriman" : "Ambil di toko"}
              </div>
              <div className="text-on-surface-variant mt-0.5 leading-relaxed">
                {order.pickupMethod === "DELIVERY"
                  ? order.address || "-"
                  : "Workshop Faeyza Printing (Jl. Pawon Raya Jl. Harapankita No.22A, Bencongan, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten 15810)"}
              </div>
            </div>
            <div>
              <div className="uppercase tracking-wider font-bold text-outline text-[10px] mb-1">Pembayaran</div>
              <div className="font-bold text-on-surface text-sm">{order.paymentMethod || "-"}</div>
              <div className="text-on-surface-variant mt-0.5">
                {formatDateTime(order.updatedAt)}
              </div>
              <div className="text-emerald-700 font-semibold">Verifikasi Otomatis</div>
            </div>
          </div>

          {/* Invoice items table */}
          <div className="py-5 overflow-x-auto px-6">
            <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-surface-container-high text-outline uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 font-bold">ITEM &amp; SPESIFIKASI</th>
                  <th className="py-2.5 font-bold text-right">HARGA SATUAN</th>
                  <th className="py-2.5 font-bold text-center">JUMLAH</th>
                  <th className="py-2.5 font-bold text-right">TOTAL HARGA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-on-surface-variant">
                <tr>
                  <td className="py-3.5 pr-2">
                    <div className="font-bold text-on-surface">{order.product.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {order.material?.name || "Standard"} · {order.pickupMethod === "DELIVERY" ? "Delivery" : "Pickup"}
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-right font-medium whitespace-nowrap">
                    {formatRupiah(productUnitPrice)}
                  </td>
                  <td className="py-3.5 px-2 text-center font-medium">
                    {order.quantity} {order.product.unit}
                  </td>
                  <td className="py-3.5 pl-2 text-right font-semibold text-on-surface whitespace-nowrap">
                    {formatRupiah(productSubtotal)}
                  </td>
                </tr>
                {order.finishings.map((of) => (
                  <tr key={of.id}>
                    <td className="py-3.5 pr-2">
                      <div className="font-medium text-on-surface">{of.finishing?.name || "Finishing"}</div>
                      <div className="text-xs text-on-surface-variant">{of.finishing?.unit || ""}</div>
                    </td>
                    <td className="py-3.5 px-2 text-right text-outline font-mono">-</td>
                    <td className="py-3.5 px-2 text-center text-outline font-mono">-</td>
                    <td className="py-3.5 pl-2 text-right font-semibold text-on-surface-variant whitespace-nowrap">
                      {formatRupiah(of.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="pt-3 border-t-2 border-on-surface flex justify-between items-baseline mb-6 mx-6">
            <span className="text-base font-bold text-on-surface">Total bayar</span>
            <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              {formatRupiah(order.totalPrice)}
            </span>
          </div>

          <div className="mx-6 mb-6 flex justify-end no-print">
            <div className="w-full sm:w-56">
              <PrintInvoiceButton />
            </div>
          </div>
      </article>
    </div>
  );
}
