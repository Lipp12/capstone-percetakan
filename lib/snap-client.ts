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
  // Sandbox client key selalu diawali "SB-Mid-client-".
  const isSandbox = clientKey.startsWith("SB-Mid-client-");
  return isSandbox
    ? "https://app.sandbox.midtrans.com/snap/snap.js"
    : "https://app.midtrans.com/snap/snap.js";
}

export function loadSnapScript(clientKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.snap?.pay) return Promise.resolve();
  if (snapScriptPromise) return snapScriptPromise;

  snapScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-midtrans-snap]");
    const script = existing || document.createElement("script");

    script.src = snapScriptUrl(clientKey);
    script.async = true;
    script.setAttribute("data-client-key", clientKey);
    script.setAttribute("data-midtrans-snap", "true");

    script.onload = () => {
      if (window.snap?.pay) resolve();
      else {
        snapScriptPromise = null;
        reject(new Error("Snap.js berhasil dimuat tetapi tidak tersedia."));
      }
    };
    script.onerror = () => {
      snapScriptPromise = null;
      reject(new Error("Gagal memuat Snap.js dari Midtrans."));
    };

    if (!existing) document.body.appendChild(script);
  });

  return snapScriptPromise;
}

export function payWithSnap(token: string, callbacks: SnapCallbacks): void {
  if (!window.snap?.pay) {
    throw new Error("Snap.js belum siap. Silakan muat ulang halaman.");
  }
  window.snap.pay(token, callbacks);
}
