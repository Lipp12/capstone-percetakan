// ---------------------------------------------------------------------------
// Mock API — dipakai otomatis ketika VITE_API_BASE_URL belum diisi.
// Data disimpan di localStorage supaya pesanan baru muncul di panel admin.
// ---------------------------------------------------------------------------
import { mockOrders } from '../data/orders'
import { products } from '../data/products'
import { ORDER_STATUS, STATUS_META } from '../data/orderStatus'

const ORDERS_KEY = 'faeyza.orders.v2'
const clone = (value) => JSON.parse(JSON.stringify(value))
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function readOrders() {
  try {
    const stored = window.localStorage.getItem(ORDERS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Storage bisa diblokir (mode privat). Lanjut dengan data seed.
  }

  const seed = clone(mockOrders)
  writeOrders(seed)
  return seed
}

function writeOrders(orders) {
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  } catch {
    // Abaikan quota / private mode; data tetap hidup di memori selama sesi.
  }
}

function makeOrderCode(date = new Date()) {
  const stamp = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
    .format(date)
    .replaceAll('-', '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${stamp}-${random}`
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

async function describeFile(file) {
  if (!file) return null
  let url = '/files/sample-design.pdf'

  if (file.type?.startsWith('image/') && file.size <= 1_200_000) {
    const dataUrl = await readFileAsDataUrl(file)
    if (dataUrl) url = dataUrl
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    url,
  }
}

async function simulateUpload(onUploadProgress) {
  const steps = [8, 18, 31, 46, 62, 74, 86, 94, 100]
  for (const progress of steps) {
    await wait(70 + Math.round(Math.random() * 60))
    onUploadProgress?.({ loaded: progress, total: 100, progress: progress / 100 })
  }
}

export async function fetchProducts() {
  await wait(320)
  return clone(products)
}

export async function fetchOrders() {
  await wait(480)
  return readOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createOrder(formData, { onUploadProgress } = {}) {
  await simulateUpload(onUploadProgress)
  await wait(450)

  const file = formData.get('file')
  const quantity = Number(formData.get('quantity')) || 0
  const discountRate = Number(formData.get('discount_rate')) || 0
  const createdAt = new Date().toISOString()
  const code = makeOrderCode()
  const product = {
    slug: formData.get('product_slug') ?? '',
    name: formData.get('product_name') ?? 'Produk cetak',
  }

  const order = {
    id: code,
    code,
    createdAt,
    status: ORDER_STATUS.MENUNGGU,
    customer: {
      name: String(formData.get('customer_name') ?? '').trim(),
      email: String(formData.get('customer_email') ?? '').trim(),
      phone: String(formData.get('customer_phone') ?? '').trim(),
      address: String(formData.get('customer_address') ?? '').trim(),
    },
    product,
    material: formData.get('material_label') ?? '',
    size: formData.get('size_label') ?? '',
    quantity,
    unitPrice: Number(formData.get('unit_price')) || 0,
    discount: discountRate,
    total: Number(formData.get('total')) || 0,
    notes: String(formData.get('notes') ?? '').trim(),
    file: await describeFile(file),
    rejectReason: null,
    timeline: [
      {
        status: ORDER_STATUS.MENUNGGU,
        label: 'Pesanan dibuat',
        at: createdAt,
        note: 'Pesanan masuk dari web checkout pelanggan.',
      },
    ],
  }

  const orders = readOrders()
  orders.unshift(order)
  writeOrders(orders)

  return clone(order)
}

export async function updateOrderStatus(id, status, { note, rejectReason } = {}) {
  await wait(620)
  const orders = readOrders()
  const index = orders.findIndex((order) => order.id === id)

  if (index === -1) {
    const error = new Error('Pesanan tidak ditemukan. Mungkin sudah dihapus atau data demo direset.')
    error.code = 'NOT_FOUND'
    throw error
  }

  const current = orders[index]
  const meta = STATUS_META[status]
  if (!meta) {
    const error = new Error('Status pesanan tidak dikenal.')
    error.code = 'INVALID_STATUS'
    throw error
  }

  const updated = {
    ...current,
    status,
    rejectReason: status === ORDER_STATUS.DITOLAK ? rejectReason ?? current.rejectReason : current.rejectReason,
    timeline: [
      ...(current.timeline ?? []),
      {
        status,
        label: meta.label,
        at: new Date().toISOString(),
        note:
          note?.trim() ||
          (status === ORDER_STATUS.DITOLAK
            ? rejectReason || 'Pesanan ditolak oleh admin.'
            : `Status diperbarui menjadi ${meta.label}.`),
      },
    ],
  }

  orders[index] = updated
  writeOrders(orders)
  return clone(updated)
}

export function getMockFileCount() {
  try {
    return readOrders().length
  } catch {
    return mockOrders.length
  }
}
