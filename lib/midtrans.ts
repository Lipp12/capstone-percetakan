import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Server-side helper untuk Midtrans Snap.
 *
 * TIDAK ada key yang boleh dikirim ke browser di file ini. Server Key dan
 * Signature Secret Key hanya dipakai di sini (API route / server component).
 */

export type MidtransNotificationPayload = {
  order_id?: string;
  status_code?: string | number;
  gross_amount?: string | number;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  status_message?: string;
  [key: string]: unknown;
};

export type SnapTransactionParams = {
  orderId: string;
  orderNumber: string;
  grossAmount: number;
  productName: string;
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  /** Kode `enabled_payments` Midtrans. Kosong = tampilkan semua metode. */
  enabledPayments?: string[];
  siteUrl?: string;
};

export type SnapTransactionResult = {
  token: string;
  redirectUrl: string;
};

type MidtransConfig = {
  serverKey: string;
  signatureSecretKey: string;
  clientKey: string;
  isProduction: boolean;
  apiBaseUrl: string;
  snapApiBaseUrl: string;
};

export class MidtransRequestError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "MidtransRequestError";
    this.status = status;
    this.details = details;
  }
}

export function getMidtransConfig(): MidtransConfig {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();

  return {
    serverKey,
    // Sejak 28 Okt 2026 notifikasi ditandatangani dengan Signature Secret Key.
    // Untuk akun lama, Server Key masih dipakai -> jadi fallback.
    signatureSecretKey: (process.env.MIDTRANS_SIGNATURE_SECRET_KEY || "").trim() || serverKey,
    clientKey: (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim(),
    isProduction,
    apiBaseUrl: isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
    snapApiBaseUrl: isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com",
  };
}

export function isMidtransConfigured(): boolean {
  const config = getMidtransConfig();
  return Boolean(config.serverKey && config.clientKey);
}

function basicAuth(serverKey: string): string {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const messages = (body as { error_messages?: unknown }).error_messages;
    if (Array.isArray(messages) && messages.length > 0) {
      return messages.map(String).join(" ");
    }
    const message = (body as { status_message?: unknown }).status_message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

/** Buat Snap transaction token. Dipanggil HANYA dari server. */
export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<SnapTransactionResult> {
  const config = getMidtransConfig();
  if (!config.serverKey) {
    throw new MidtransRequestError(
      "MIDTRANS_SERVER_KEY belum diisi. Tambahkan ke file .env lalu restart server.",
      500
    );
  }

  const grossAmount = Math.round(params.grossAmount);
  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    throw new MidtransRequestError("Total pembayaran tidak valid.", 400);
  }

  const siteUrl = (params.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  const body: Record<string, unknown> = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: grossAmount,
    },
    ...(params.enabledPayments && params.enabledPayments.length > 0
      ? { enabled_payments: params.enabledPayments }
      : {}),
    credit_card: { secure: true },
    item_details: [
      {
        id: params.orderId,
        name: `Pesanan ${params.orderNumber} - ${params.productName}`.slice(0, 50),
        price: grossAmount,
        quantity: 1,
      },
    ],
    customer_details: {
      first_name: params.customer.name || "Pelanggan",
      email: params.customer.email,
      ...(params.customer.phone ? { phone: params.customer.phone } : {}),
    },
  };

  if (siteUrl) {
    body.callbacks = {
      finish: `${siteUrl}/orders/${params.orderId}/tracking?payment=finish`,
      pending: `${siteUrl}/orders/${params.orderId}/tracking?payment=pending`,
      error: `${siteUrl}/checkout/${params.orderId}?payment=error`,
    };
  }

  const requestToken = async (): Promise<SnapTransactionResult> => {
    let response: Response;
    try {
      response = await fetch(`${config.snapApiBaseUrl}/snap/v1/transactions`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: basicAuth(config.serverKey),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch (error) {
      throw new MidtransRequestError(
        "Tidak dapat terhubung ke Midtrans. Periksa koneksi internet server.",
        502,
        error
      );
    }

    const raw = await response.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      // biarkan fallback message di bawah
    }

    if (!response.ok || !parsed?.token) {
      throw new MidtransRequestError(
        readErrorMessage(parsed, `Gagal membuat transaksi Midtrans (HTTP ${response.status}).`),
        response.status,
        parsed ?? raw
      );
    }

    return {
      token: String(parsed.token),
      redirectUrl: String(parsed.redirect_url || ""),
    };
  };

  try {
    return await requestToken();
  } catch (error) {
    if (!(error instanceof MidtransRequestError) || !isDuplicateOrderIdError(error)) {
      throw error;
    }

    // Pelanggan pernah memilih metode pembayaran lalu menutup popup.
    // order_id belum bisa dipakai ulang selama statusnya pending -> batalkan
    // sesi lama, lalu buat token baru dengan order_id yang sama.
    await cancelPendingTransaction(params.orderId);
    return requestToken();
  }
}

function isDuplicateOrderIdError(error: MidtransRequestError): boolean {
  if (![400, 406].includes(error.status)) return false;
  const message = `${error.message} ${JSON.stringify(error.details ?? "")}`.toLowerCase();
  return (
    message.includes("order_id") &&
    (message.includes("sudah digunakan") ||
      message.includes("has been paid") ||
      message.includes("utilized") ||
      message.includes("already") ||
      message.includes("duplicate"))
  );
}

async function cancelPendingTransaction(orderId: string): Promise<void> {
  const config = getMidtransConfig();
  try {
    await fetch(`${config.apiBaseUrl}/v2/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: basicAuth(config.serverKey),
      },
      cache: "no-store",
    });
  } catch {
    // Kalau cancel gagal, request token berikutnya yang akan mengembalikan error.
  }
}

/**
 * Tanya status transaksi langsung ke Midtrans (challenge response).
 * Dipakai webhook dan tombol "Cek Status" agar tidak bergantung pada webhook saja.
 */
export async function getTransactionStatus(
  orderId: string
): Promise<MidtransNotificationPayload> {
  const config = getMidtransConfig();
  if (!config.serverKey) {
    throw new MidtransRequestError("MIDTRANS_SERVER_KEY belum diisi.", 500);
  }

  let response: Response;
  try {
    response = await fetch(
      `${config.apiBaseUrl}/v2/${encodeURIComponent(orderId)}/status`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: basicAuth(config.serverKey),
        },
        cache: "no-store",
      }
    );
  } catch (error) {
    throw new MidtransRequestError("Tidak dapat terhubung ke Midtrans.", 502, error);
  }

  const raw = await response.text();
  let parsed: MidtransNotificationPayload | null = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new MidtransRequestError(
      readErrorMessage(parsed, `Status transaksi belum tersedia (HTTP ${response.status}).`),
      response.status,
      parsed ?? raw
    );
  }

  if (!parsed) {
    throw new MidtransRequestError("Respons status Midtrans tidak valid.", 502);
  }

  return parsed;
}

/** SHA512(order_id + status_code + gross_amount + secret), dibandingkan aman. */
function matchesSignature(payload: MidtransNotificationPayload, secret: string): boolean {
  if (!secret) return false;

  const received = String(payload.signature_key || "").toLowerCase();
  if (!/^[a-f0-9]{128}$/.test(received)) return false;

  const input = [
    String(payload.order_id ?? ""),
    String(payload.status_code ?? ""),
    String(payload.gross_amount ?? ""),
    secret,
  ].join("");
  const expected = createHash("sha512").update(input).digest("hex");

  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"));
}

/** Verifikasi webhook. Menerima kunci tanda tangan baru DAN server key lama. */
export function verifyNotificationSignature(payload: MidtransNotificationPayload): boolean {
  const config = getMidtransConfig();
  if (!config.serverKey) return false;

  const keys = Array.from(
    new Set([config.signatureSecretKey, config.serverKey].filter(Boolean))
  );
  return keys.some((key) => matchesSignature(payload, key));
}

/**
 * Transaksi dianggap lunas hanya jika status_code 200,
 * transaction_status settlement/capture, dan fraud_status accept (jika ada).
 */
export function isSuccessfulPayment(payload: MidtransNotificationPayload): boolean {
  const statusCode = String(payload.status_code ?? "");
  const transactionStatus = String(payload.transaction_status ?? "").toLowerCase();
  const fraudStatus = payload.fraud_status
    ? String(payload.fraud_status).toLowerCase()
    : null;

  return (
    statusCode === "200" &&
    (transactionStatus === "settlement" || transactionStatus === "capture") &&
    (fraudStatus === null || fraudStatus === "accept")
  );
}
