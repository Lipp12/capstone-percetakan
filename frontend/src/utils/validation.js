import { fileExtension } from './format'

export const ACCEPTED_FILE_TYPES = ['pdf', 'ai', 'psd', 'png', 'jpg', 'jpeg']
export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export const isValidEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim())

export const isValidPhone = (value = '') => {
  const digits = value.replace(/[^\d+]/g, '')
  const normalized = digits.startsWith('+62') ? digits.slice(1) : digits
  return /^(62|0)\d{8,14}$/.test(normalized)
}

export function validateFile(file) {
  if (!file) return 'Berkas desain wajib diunggah.'
  const ext = fileExtension(file.name)
  if (!ACCEPTED_FILE_TYPES.includes(ext)) {
    return 'Format berkas harus PDF, AI, PSD, PNG, JPG, atau JPEG.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran berkas maksimal 25 MB.'
  }
  return ''
}

export function validateCustomerField(name, value) {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Nama lengkap wajib diisi.'
      if (value.trim().length < 3) return 'Nama minimal 3 karakter.'
      return ''
    case 'email':
      if (!value.trim()) return 'Email wajib diisi.'
      if (!isValidEmail(value)) return 'Format email belum benar (contoh: nama@email.com).'
      return ''
    case 'phone':
      if (!value.trim()) return 'Nomor telepon wajib diisi.'
      if (!isValidPhone(value)) return 'Nomor telepon tidak valid (contoh: 0812 3456 7890).'
      return ''
    case 'address':
      if (!value.trim()) return 'Alamat wajib diisi.'
      if (value.trim().length < 10) return 'Alamat terlalu singkat, mohon lengkapi.'
      return ''
    default:
      return ''
  }
}

export function validateQuantity(value, minOrder = 1) {
  const quantity = Number(value)
  if (!value || Number.isNaN(quantity)) return 'Kuantitas wajib diisi.'
  if (!Number.isInteger(quantity)) return 'Kuantitas harus bilangan bulat.'
  if (quantity < minOrder) return `Minimal pemesanan ${minOrder} pcs untuk produk ini.`
  return ''
}
