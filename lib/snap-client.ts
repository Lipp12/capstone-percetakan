"use client";

/**
 * Loader Snap.js untuk browser. Client Key memang bersifat publik dan aman
 * disematkan di frontend (berbeda dengan Server Key).
 */

export type SnapResult = {
  transaction_id?: string;
  order_id?: string;
  payment_type?: string;
  status_message?: string;
  [key: string]: unknown;
};

export type SnapCallbacks = {
  onSuccess: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: SnapCallbacks) => void;
    };
  }
}

let snapScriptPromise: Promise<void> | null = null;

function snapScriptUrl(clientKey: string): string {
  // Hanya gunakan production jika NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION bernilai "true"
  // dan client key bukan key sandbox.
  const isExplicitProduction =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const isSandbox =
    !isExplicitProduction || clientKey.startsWith("SB-Mid-client-");

  return isSandbox
    ? "https://app.sandbox.midtrans.com/snap/snap.js"
    : "https://app.midtrans.com/snap/snap.js";
}

export function loadSnapScript(clientKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const targetUrl = snapScriptUrl(clientKey);
  const existing = document.querySelector<HTMLScriptElement>("script[data-midtrans-snap]");

  // Jika script yang terpasang berasal dari environment yang berbeda (misal app.midtrans.com vs sandbox),
  // hapus script lama agar digantikan dengan script yang benar.
  if (existing && existing.src !== targetUrl) {
    existing.remove();
    delete (window as any).snap;
    snapScriptPromise = null;
  }

  if (window.snap?.pay) return Promise.resolve();
  if (snapScriptPromise) return snapScriptPromise;

  snapScriptPromise = new Promise<void>((resolve, reject) => {
    const currentScript =
      document.querySelector<HTMLScriptElement>("script[data-midtrans-snap]") ||
      document.createElement("script");

    currentScript.src = targetUrl;
    currentScript.async = true;
    currentScript.setAttribute("data-client-key", clientKey);
    currentScript.setAttribute("data-midtrans-snap", "true");

    currentScript.onload = () => {
      if (window.snap?.pay) resolve();
      else {
        snapScriptPromise = null;
        reject(new Error("Snap.js berhasil dimuat tetapi tidak tersedia."));
      }
    };
    currentScript.onerror = () => {
      snapScriptPromise = null;
      reject(new Error("Gagal memuat Snap.js dari Midtrans."));
    };

    if (!document.body.contains(currentScript)) {
      document.body.appendChild(currentScript);
    }
  });

  return snapScriptPromise;
}

export function payWithSnap(token: string, callbacks: SnapCallbacks): void {
  if (!window.snap?.pay) {
    throw new Error("Snap.js belum siap. Silakan muat ulang halaman.");
  }
  window.snap.pay(token, callbacks);
}
