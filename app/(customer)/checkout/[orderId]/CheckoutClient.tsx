"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "../../../../lib/utils";
import {
  QrCode,
  Wallet,
  Landmark,
  CreditCard,
  Store,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import {
  MIDTRANS_CHANNELS,
  type MidtransChannelId,
} from "@/lib/midtrans-channels";
import { loadSnapScript, payWithSnap, type SnapResult } from "@/lib/snap-client";

interface Props {
  order: any;
}

const CHANNEL_ICONS: Record<MidtransChannelId, LucideIcon> = {
  QRIS: QrCode,
  GOPAY: Wallet,
  BRI: Landmark,
  MANDIRI: Landmark,
  BCA: Landmark,
  BNI: Landmark,
  OTHER_VA: Landmark,
  SHOPEEPAY: Wallet,
  CARD: CreditCard,
  RETAIL: Store,
  ALL: Zap,
};

const CHECKOUT_CHANNELS = MIDTRANS_CHANNELS.filter(
  ({ id }) => id !== "OTHER_VA" && id !== "CARD" && id !== "ALL"
);

export default function CheckoutClient({ order }: Props) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<MidtransChannelId>("QRIS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCheckStatus, setShowCheckStatus] = useState(false);

  const paidStatuses = [
    "PAID",
    "DESIGN_APPROVED",
    "IN_PRODUCTION",
    "FINISHING",
    "READY",
    "SHIPPING",
    "COMPLETED",
  ];
  const isAlreadyPaid =
    paidStatuses.includes(order.status) ||
    order.statusHistory.some(
      (history: { status: string }) => history.status === "PAID"
    );

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  function goToTracking() {
    router.replace(`/orders`);
    router.refresh();
  }

  async function verifyAndContinue(showPendingInfo: boolean) {
    setLoading(true);
    setError("");
    setInfo("Memverifikasi pembayaran ke Midtrans...");

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();

      if (data.paid) {
        setSuccess(true);
        setInfo("");
        setShowCheckStatus(false);
        goToTracking();
        return;
      }

      setLoading(false);
      if (showPendingInfo) {
        setInfo(
          "Pembayaran masih diproses Midtrans. Status halaman akan diperbarui otomatis."
        );
        router.replace(`/orders/${order.id}/tracking?payment=pending`);
        router.refresh();
      } else {
        setInfo(
          data.message ||
            "Pembayaran belum terdeteksi. Klik Cek Status Pembayaran beberapa saat lagi."
        );
        setShowCheckStatus(true);
      }
    } catch {
      setLoading(false);
      setInfo("");
      setError("Gagal menghubungi server verifikasi. Silakan coba lagi.");
      setShowCheckStatus(true);
    }
  }

  function handleSnapResult(result: SnapResult, pending = false) {
    void verifyAndContinue(pending || result?.transaction_status === "pending");
  }

  async function handleCheckStatus() {
    setShowCheckStatus(false);
    await verifyAndContinue(false);
  }

  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    setLoading(true);
    const tokenCacheKey = `midtrans-token:${order.id}:${paymentMethod}`;

    try {
      let redirectUrl = "";
      let token = "";
      try {
        const cached = JSON.parse(sessionStorage.getItem(tokenCacheKey) || "null");
        if (cached?.token && Date.now() - cached.createdAt < 23 * 60 * 60 * 1000) {
          token = cached.token;
        }
      } catch {
        // abaikan cache rusak
      }

      if (!token) {
        const res = await fetch(`/api/orders/${order.id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "MIDTRANS", channel: paymentMethod }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Gagal menyiapkan pembayaran Midtrans");
          setLoading(false);
          return;
        }

        if (data.alreadyPaid) {
          setSuccess(true);
          goToTracking();
          return;
        }

        token = data.token;
        redirectUrl = String(data.redirectUrl || "");
        try {
          sessionStorage.setItem(
            tokenCacheKey,
            JSON.stringify({ token, createdAt: Date.now() })
          );
        } catch {
          // sessionStorage bisa diblokir, tidak menghalangi pembayaran
        }
      }

      // Tanpa Client Key, pembayaran tetap jalan lewat halaman Midtrans
      // (Snap redirect). Token dari server sudah berisi redirect_url.
      if (!clientKey) {
        if (!redirectUrl) {
          setError("Midtrans tidak mengembalikan URL pembayaran. Silakan coba lagi.");
          setLoading(false);
          return;
        }
        setInfo("Membuka halaman pembayaran Midtrans...");
        window.location.assign(redirectUrl);
        return;
      }

      await loadSnapScript(clientKey);
      payWithSnap(token, {
        onSuccess: (result) => handleSnapResult(result),
        onPending: (result) => handleSnapResult(result, true),
        onError: (result) => {
          sessionStorage.removeItem(tokenCacheKey);
          setLoading(false);
          setError(
            `Pembayaran Midtrans gagal: ${result?.status_message || "silakan coba lagi"}`
          );
        },
        onClose: () => {
          try {
            sessionStorage.removeItem(tokenCacheKey);
          } catch {}
          setLoading(false);
          setInfo(
            "Popup ditutup. Jika pembayaran sudah dilakukan, klik Cek Status Pembayaran."
          );
          setShowCheckStatus(true);
        },
      });
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan jaringan saat menyiapkan pembayaran"
      );
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.9fr)] gap-8">
      {/* Kolom Kiri: Pilihan Metode Bayar */}
      <div className="space-y-5">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-start gap-2">
            <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
            <span>{info}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pembayaran berhasil! Mengalihkan ke Live Order Tracking...</span>
          </div>
        )}

        {isAlreadyPaid && (
          <div className="p-4 bg-primary-container/20 border border-blue-200 text-primary text-xs rounded-2xl flex items-center justify-between">
            <span>Pembayaran pesanan ini sudah tercatat.</span>
            <button
              onClick={goToTracking}
              className="px-3 py-1 bg-primary text-white rounded-lg font-semibold"
            >
              Lihat Tracking
            </button>
          </div>
        )}

        {/* Daftar saluran: ringkas, dikelompokkan */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Pilih Saluran Pembayaran
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHECKOUT_CHANNELS.map((opt) => {
              const Icon = CHANNEL_ICONS[opt.id];
              const isSelected = paymentMethod === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  disabled={isAlreadyPaid}
                  className={`flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left transition disabled:opacity-60 ${
                    isSelected
                      ? "border-primary bg-primary-container/20 ring-2 ring-primary/20"
                      : "border-outline-variant/50 bg-surface-container-low hover:border-primary"
                  }`}
                >
                  <span
                    className={`rounded-lg p-2 ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-primary-container/40 text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-on-surface">
                      {opt.name}
                    </span>
                    <span className="block truncate text-xs text-on-surface-variant">
                      {opt.account}
                    </span>
                  </span>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-primary" : "border-outline-variant"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Ringkasan Lengkap & CTA Bayar */}
      <div className="space-y-4">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-on-surface pb-3 border-b border-surface-container-low flex items-center justify-between">
            <span>Ringkasan Pesanan</span>
            <span className="text-xs text-primary font-semibold">#{order.orderNumber}</span>
          </h3>

          <div className="space-y-2 text-xs text-on-surface-variant">
            <div className="flex justify-between">
              <span className="text-outline">Produk:</span>
              <span className="font-semibold text-on-surface">{order.product.name}</span>
            </div>

            {order.material && (
              <div className="flex justify-between">
                <span className="text-outline">Bahan:</span>
                <span className="font-medium text-on-surface">{order.material.name}</span>
              </div>
            )}

            {order.width && order.height && (
              <div className="flex justify-between">
                <span className="text-outline">Ukuran:</span>
                <span className="font-medium text-on-surface">
                  {order.width} x {order.height} meter ({order.width * order.height} m²)
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-outline">Jumlah:</span>
              <span className="font-medium text-on-surface">
                {order.quantity} {order.product.unit}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-outline">Pengiriman:</span>
              <span className="font-medium text-on-surface">
                {order.pickupMethod === "DELIVERY" ? "Kurir Delivery" : "Ambil di Toko"}
              </span>
            </div>

            {order.finishings.length > 0 && (
              <div className="pt-2 border-t border-surface-container-low">
                <span className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                  Finishing:
                </span>
                {order.finishings.map((f: any) => (
                  <div key={f.id} className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>• {f.finishing.name}</span>
                    <span>{formatRupiah(f.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-surface-container-low flex items-baseline justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Tagihan</span>
            <span className="text-2xl font-black text-primary">
              {formatRupiah(order.totalPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={loading || success || isAlreadyPaid}
            className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Konfirmasi Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {showCheckStatus && !isAlreadyPaid && (
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={loading}
              className="w-full py-3 px-6 rounded-2xl border border-primary text-primary font-bold text-xs hover:bg-primary-container/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cek Status Pembayaran</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-outline">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verifikasi aman dan data terenkripsi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
