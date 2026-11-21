"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Polling ringan untuk pesanan yang baru saja dibayar.
 * Berguna kalau popup Snap ditutup sebelum callback atau webhook Midtrans
 * terlambat datang: begitu server mengonfirmasi lunas, halaman di-refresh
 * sehingga stepper langsung lanjut ke tahap pengecekan desain.
 */
export default function PaymentStatusRefresher({
  orderId,
  active,
}: {
  orderId: string;
  active: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    let stopped = false;
    let inFlight = false;

    const check = async () => {
      if (stopped || inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!stopped && data?.paid) {
          router.refresh();
        }
      } catch {
        // polled lagi pada interval berikutnya
      } finally {
        inFlight = false;
      }
    };

    const timer = window.setInterval(check, 8000);
    check();

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [orderId, active, router]);

  return null;
}
