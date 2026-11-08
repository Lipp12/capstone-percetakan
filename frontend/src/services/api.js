// ---------------------------------------------------------------------------
// Satu pintu komunikasi ke API milik Alif.
//
// - Jika VITE_API_BASE_URL kosong  -> seluruh request memakai mock lokal.
// - Jika diisi                     -> request multipart / JSON lewat axios.
// - VITE_API_TOKEN opsional        -> dikirim sebagai Authorization: Bearer ...
//
// Kontrak endpoint (bisa diubah lewat .env):
//   GET    /products
//   GET    /orders
//   POST   /orders                        (multipart/form-data)
//   PATCH  /orders/:id/status             (JSON: { status, note, reject_reason })
// ---------------------------------------------------------------------------
import axios from 'axios'
import * as mock from './mockApi'

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const BASE_URL = rawBaseUrl.replace(/\/+$/, '')
const TOKEN = (import.meta.env.VITE_API_TOKEN ?? '').trim()

const ORDERS_ENDPOINT = (import.meta.env.VITE_ORDERS_ENDPOINT ?? '/orders').trim() || '/orders'
const PRODUCTS_ENDPOINT = (import.meta.env.VITE_PRODUCTS_ENDPOINT ?? '/products').trim() || '/products'

export const isMockMode = !BASE_URL

export const apiConfig = {
  baseUrl: BASE_URL || null,
  ordersEndpoint: ORDERS_ENDPOINT,
  productsEndpoint: PRODUCTS_ENDPOINT,
  hasToken: Boolean(TOKEN),
  mode: isMockMode ? 'mock' : 'live',
}

const http = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 45_000,
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${TOKEN}`
  }
  return config
})

function unwrapResponse(response) {
  const payload = response?.data
  if (payload == null) return null
  if (payload.data !== undefined) return payload.data
  return payload
}

function normalizeOrder(raw) {
  if (!raw || typeof raw !== 'object') return raw

  const id = raw.id ?? raw.code ?? raw.order_id ?? raw.orderId
  const customer =
    raw.customer ??
    (raw.customer_name
      ? {
          name: raw.customer_name,
          email: raw.customer_email ?? raw.email ?? '',
          phone: raw.customer_phone ?? raw.phone ?? '',
          address: raw.customer_address ?? raw.address ?? '',
        }
      : { name: '', email: '', phone: '', address: '' })

  const file = raw.file ?? {
    name: raw.file_name ?? raw.design_file_name ?? 'berkas-desain',
    size: raw.file_size ?? raw.design_file_size ?? 0,
    type: raw.file_type ?? raw.design_file_type ?? 'application/octet-stream',
    url: raw.file_url ?? raw.design_file_url ?? raw.fileUrl ?? '',
  }

  return {
    ...raw,
    id,
    code: raw.code ?? id,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    status: raw.status ?? 'menunggu',
    customer,
    product: raw.product ?? { slug: raw.product_slug ?? '', name: raw.product_name ?? '' },
    material: raw.material ?? raw.material_label ?? '',
    size: raw.size ?? raw.size_label ?? '',
    quantity: Number(raw.quantity ?? raw.qty ?? 0),
    total: Number(raw.total ?? raw.total_price ?? 0),
    unitPrice: Number(raw.unitPrice ?? raw.unit_price ?? 0),
    discount: Number(raw.discount ?? raw.discount_rate ?? 0),
    notes: raw.notes ?? '',
    file: file?.url || file?.name ? file : null,
    rejectReason: raw.rejectReason ?? raw.reject_reason ?? null,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
  }
}

function normalizeOrderList(payload) {
  const list = Array.isArray(payload) ? payload : payload?.orders ?? payload?.items ?? payload?.results ?? []
  return Array.isArray(list) ? list.map(normalizeOrder) : []
}

export async function fetchProducts() {
  if (isMockMode) return mock.fetchProducts()

  const response = await http.get(PRODUCTS_ENDPOINT)
  const payload = unwrapResponse(response)
  const list = Array.isArray(payload) ? payload : payload?.products ?? payload?.items ?? []
  return Array.isArray(list) ? list : []
}

export async function fetchOrders() {
  if (isMockMode) return mock.fetchOrders()

  const response = await http.get(ORDERS_ENDPOINT)
  return normalizeOrderList(unwrapResponse(response))
}

export async function createOrder(formData, { onUploadProgress } = {}) {
  if (isMockMode) return mock.createOrder(formData, { onUploadProgress })

  const response = await http.post(ORDERS_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })

  const payload = unwrapResponse(response)
  const order = payload?.order ?? payload
  return normalizeOrder(order)
}

export async function updateOrderStatus(id, status, { note, rejectReason } = {}) {
  if (isMockMode) return mock.updateOrderStatus(id, status, { note, rejectReason })

  const response = await http.patch(`${ORDERS_ENDPOINT}/${encodeURIComponent(id)}/status`, {
    status,
    note: note ?? '',
    reject_reason: rejectReason ?? null,
  })

  const payload = unwrapResponse(response)
  const order = payload?.order ?? payload
  return normalizeOrder(order)
}

export function getApiErrorMessage(error) {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'

  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const serverMessage =
      data?.message ??
      data?.error?.message ??
      (typeof data?.error === 'string' ? data.error : null) ??
      data?.errors?.message

    if (serverMessage) return String(serverMessage)

    if (Array.isArray(data?.errors) && data.errors.length) {
      return data.errors.map((item) => item.message ?? item).join(', ')
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'Server terlalu lama merespons. Periksa koneksi lalu coba lagi.'
    }

    if (!error.response) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet atau alamat API, lalu coba lagi.'
    }

    if (error.response.status === 401 || error.response.status === 403) {
      return 'Akses ditolak. Periksa token API pada konfigurasi frontend.'
    }

    return `Server menolak permintaan (HTTP ${error.response.status}). Silakan coba lagi.`
  }

  return error.message || 'Terjadi kesalahan. Silakan coba lagi.'
}

export function resolveFileUrl(url) {
  if (!url) return ''
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  if (!BASE_URL) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export default http
