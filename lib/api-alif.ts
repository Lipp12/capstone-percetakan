// ---------------------------------------------------------------------------
// Helper komunikasi ke API Alif.
// - Jika ALIF_API_BASE_URL kosong -> mode mock (tidak ada request jaringan).
// - Token bersifat rahasia: hanya dipakai di server (route handler / server
//   component), jangan pernah diekspos ke browser.
// ---------------------------------------------------------------------------

export interface AlifConfig {
  baseUrl: string;
  token: string | null;
  ordersEndpoint: string;
  productsEndpoint: string;
}

export function getAlifConfig(): AlifConfig {
  const rawBaseUrl = (process.env.ALIF_API_BASE_URL ?? "").trim();
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const token = (process.env.ALIF_API_TOKEN ?? "").trim() || null;
  const ordersEndpoint = (process.env.ALIF_ORDERS_ENDPOINT ?? "/orders").trim() || "/orders";
  const productsEndpoint = (process.env.ALIF_PRODUCTS_ENDPOINT ?? "/products").trim() || "/products";
  return { baseUrl, token, ordersEndpoint, productsEndpoint };
}

export function isAlifConfigured(): boolean {
  return Boolean(getAlifConfig().baseUrl);
}

// Daftar field multipart yang saat ini dikirim ke API Alif (untuk dicocokkan
// dengan dokumentasi API Alif). Field "file" hanya ada jika pelanggan mengunggah
// berkas desain.
export const ALIF_ORDER_FIELDS = [
  "order_id",
  "order_number",
  "customer_name",
  "customer_email",
  "customer_phone",
  "product_name",
  "product_slug",
  "material",
  "quantity",
  "total_price",
  "notes",
  "design_file_url",
  "file",
] as const;

export interface AlifSyncResult {
  ok: boolean;
  mock: boolean;
  error?: string;
}

export async function syncOrderToAlif(formData: FormData): Promise<AlifSyncResult> {
  const config = getAlifConfig();
  if (!config.baseUrl) {
    // Mode mock: anggap berhasil agar alur lokal tetap berjalan.
    return { ok: true, mock: true };
  }

  try {
    const url = `${config.baseUrl}${config.ordersEndpoint}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (config.token) headers.Authorization = `Bearer ${config.token}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let message = `Server menolak permintaan (HTTP ${response.status}).`;
      try {
        const data = await response.json();
        message = data?.message ?? data?.error?.message ?? data?.error ?? message;
      } catch {
        // ignore
      }
      return { ok: false, mock: false, error: String(message) };
    }

    return { ok: true, mock: false };
  } catch (error: any) {
    return {
      ok: false,
      mock: false,
      error: error?.message || "Tidak dapat terhubung ke API Alif.",
    };
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (!error) return "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.";
  if (error instanceof Error) return error.message;
  return String(error);
}