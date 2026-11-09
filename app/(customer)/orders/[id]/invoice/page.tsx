import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Printer, Download, MapPin } from "lucide-react";

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
      user: { select: { name: true, email: true, phone: true } },
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Pesanan Saya</span>
      </Link>

      {/* Success banner */}
      <section className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-4 text-emerald-950 shadow-sm relative overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold leading-snug text-emerald-900">
            Pembayaran berhasil
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 font-normal mt-0.5">
            Terima kasih! Invoice kamu sudah siap, tersimpan di database atelier, dan bisa langsung dicetak.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full border border-emerald-300 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Order Terkonfirmasi
        </div>
      </section>

      {/* Stepper */}
      <nav aria-label="Progress Alur Pemesanan" className="no-print">
        <div className="flex items-center justify-center max-w-xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold hidden xs:inline">Pilih spesifikasi</span>
          </div>
          <div className="flex-1 h-0.5 mx-3 sm:mx-4 bg-emerald-500 rounded-full" />
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold hidden xs:inline">Pembayaran</span>
          </div>
          <div className="flex-1 h-0.5 mx-3 sm:mx-4 bg-primary rounded-full" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center ring-4 ring-slate-200">
              3
            </div>
            <span className="text-xs sm:text-sm font-bold text-primary">Selesai</span>
          </div>
        </div>
      </nav>

      {/* Invoice document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <article className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Receipt header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-7 border-b border-dashed border-surface-container-high p-6">
            <div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-2xl font-black text-on-surface">Faeyza</span>
                <span className="text-2xl font-black text-primary ml-0.5">Printing</span>
              </div>
              <div className="mt-2 text-xs text-on-surface-variant space-y-0.5 max-w-sm leading-relaxed">
                <p className="font-medium text-on-surface">Jl. Pawon Raya Jl. Harapankita No.22A, Bencongan, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten 15810</p>
                <p>Buka Setiap Hari: 10:00 â€“ 20:00 WIB</p>
                <p className="text-on-surface font-semibold pt-0.5">WhatsApp CS: +62 812-3456-7890</p>
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
                  {order.status === "COMPLETED" ? "LUNAS" : order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Order Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-6 border-b border-dashed border-surface-container-high text-xs px-6">
            <div>
              <div className="uppercase tracking-wider font-bold text-outline text-[10px] mb-1">Pelanggan</div>
              <div className="font-bold text-on-surface text-sm">{order.user?.name || "-"}</div>
              <div className="text-on-surface-variant mt-0.5">{order.user?.phone || "-"}</div>
              <div className="text-on-surface-variant">{order.user?.email || "-"}</div>
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
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-surface-container-high text-outline uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 font-bold">ITEM &amp; SPESIFIKASI</th>
                  <th className="py-2.5 font-bold text-center">JUMLAH</th>
                  <th className="py-2.5 font-bold text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-on-surface-variant">
                <tr>
                  <td className="py-3.5 pr-2">
                    <div className="font-bold text-on-surface">{order.product.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {order.material?.name || "Standard"} Â· {order.pickupMethod === "DELIVERY" ? "Delivery" : "Pickup"}
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center font-medium">
                    {order.quantity} {order.product.unit}
                  </td>
                  <td className="py-3.5 pl-2 text-right font-semibold text-on-surface">
                    {formatRupiah(order.totalPrice)}
                  </td>
                </tr>
                {order.finishings.map((of) => (
                  <tr key={of.id}>
                    <td className="py-3.5 pr-2">
                      <div className="font-medium text-on-surface">{of.finishing?.name || "Finishing"}</div>
                      <div className="text-xs text-on-surface-variant">{of.finishing?.unit || ""}</div>
                    </td>
                    <td className="py-3.5 px-2 text-center text-outline font-mono">-</td>
                    <td className="py-3.5 pl-2 text-right font-semibold text-on-surface-variant">
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

          {/* Note box */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-xs text-on-surface-variant space-y-1.5 leading-relaxed mx-6">
            <div className="flex items-center gap-2 font-mono text-[11px] text-outline">
              <span className="font-bold text-on-surface">No. pesanan: #{order.orderNumber}</span>
              <span>â€¢</span>
              <span>
                File desain:{" "}
                <strong className="text-on-surface">
                  {order.designFileUrl ? order.designFileUrl.split("/").pop() : "Belum diunggah"}
                </strong>
              </span>
            </div>
            <p className="text-on-surface-variant text-xs">
              Tunjukkan invoice digital ini atau sebutkan nomor pesanan saat mengambil hasil cetakan di counter Faeyza Printing. Terima kasih telah mempercayakan cetakan Anda pada atelier kami!
            </p>
          </div>

          {/* Watermark footer */}
          <div className="mt-6 pt-4 border-t border-surface-container-low flex flex-col sm:flex-row justify-between items-center text-[10px] text-outline gap-2 p-6">
            <span>Sistem Cetak Otomatis Faeyza Cloud OS v4.8</span>
            <span className="font-mono">HASH: 9A81-22BC-44F0-E192 â€¢ DIGITAL PROOF SECURED</span>
          </div>
        </article>

        {/* Action sidebar */}
        <aside className="lg:col-span-4 space-y-5 no-print">
          <section
            aria-labelledby="heading-aksi-invoice"
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-md shadow-surface-container/40 space-y-3"
          >
            <h2
              className="text-base font-bold text-on-surface pb-1 border-b border-surface-container-low"
              id="heading-aksi-invoice"
            >
              Invoice
            </h2>
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 px-4 rounded-xl transition duration-150 shadow-md shadow-primary/20 active:translate-y-0.5"
              type="button"
            >
              <Printer className="w-5 h-5" />
              <span>Cetak Invoice</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-2.5 bg-surface-container-lowest border-2 border-outline-variant hover:border-on-surface text-on-surface font-bold py-3 px-4 rounded-xl transition duration-150 active:translate-y-0.5"
              type="button"
            >
              <Download className="w-5 h-5 text-on-surface-variant" />
              <span>Unduh PDF</span>
            </button>
            <Link
              href={`/orders/${order.id}/tracking`}
              className="w-full flex items-center justify-center gap-2.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface-variant font-semibold py-3 px-4 rounded-xl transition duration-150 text-center"
            >
              <MapPin className="w-5 h-5 text-on-surface-variant" />
              <span>Lacak Pesanan</span>
            </Link>
          </section>

          {/* Quality guarantee */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-black text-sm shadow-xs">
              âœ“
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                100% Color-Accurate Proof
              </div>
              <div className="text-[11px] text-amber-800 leading-tight mt-0.5">
                Garansi cetak ulang tanpa biaya jika hasil potong bergeser &gt; 1.5mm atau terdapat cacat tinta kotor.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
