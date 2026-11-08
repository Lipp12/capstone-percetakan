# Faeyza Digital Printing Studio — Frontend

Antarmuka pemesanan percetakan online: katalog interaktif, formulir pesanan dengan estimasi harga live dan unggah berkas, serta panel admin untuk mengelola status pesanan.

Dibangun dengan **React 18 + Vite + Tailwind CSS + React Router + axios**, mengikuti design system dari folder referensi `stitch_web_desain_percetakan_online/`.

---

## Menjalankan proyek

Prasyarat: Node.js 18+ (disarankan 20+) dan npm.

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

Tanpa konfigurasi tambahan, aplikasi berjalan dalam **mode demo lokal**:

- Katalog dimuat dari `src/data/products.js`.
- Pesanan disimpan di `localStorage` (`faeyza.orders.v2`).
- Unggahan berkas disimulasikan dengan progress bar.
- Panel admin langsung berisi 14 pesanan contoh yang bisa diverifikasi, diproses, diselesaikan, atau ditolak.

Script lain:

```bash
npm run build     # build produksi ke dist/
npm run preview   # pratinjau hasil build
```

---

## Menghubungkan ke API Alif

1. Salin contoh environment:

   ```bash
   cp .env.example .env
   ```

2. Isi `VITE_API_BASE_URL` dengan alamat API (tanpa trailing slash):

   ```env
   VITE_API_BASE_URL=https://api.alif.dev/v1
   VITE_API_TOKEN=token-rahasia-jika-ada
   ```

3. Jalankan ulang `npm run dev` (Vite hanya membaca env saat start).

Jika `VITE_API_BASE_URL` kosong, seluruh request otomatis dialihkan ke mock lokal — tidak ada error saat backend belum siap.

### Variabel environment

| Variabel | Wajib | Default | Keterangan |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | tidak | _(kosong → mode demo)_ | Base URL API, tanpa `/` di akhir. |
| `VITE_API_TOKEN` | tidak | _(kosong)_ | Dikirim sebagai `Authorization: Bearer <token>`. |
| `VITE_PRODUCTS_ENDPOINT` | tidak | `/products` | Endpoint katalog. |
| `VITE_ORDERS_ENDPOINT` | tidak | `/orders` | Endpoint pesanan. |

### Kontrak endpoint

```text
GET    /products
GET    /orders
POST   /orders                  multipart/form-data
PATCH  /orders/:id/status       application/json
```

`POST /orders` mengirim field berikut:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `customer_name` | string | Nama lengkap pemesan. |
| `customer_email` | string | Email pemesan. |
| `customer_phone` | string | Nomor telepon/WhatsApp. |
| `customer_address` | string | Alamat pengiriman/penagihan. |
| `product_id` | string | ID produk. |
| `product_slug` | string | Slug produk. |
| `product_name` | string | Nama produk (snapshot). |
| `material_id` | string | ID bahan. |
| `material_label` | string | Label bahan (snapshot). |
| `size_id` | string | ID ukuran. |
| `size_label` | string | Label ukuran (snapshot). |
| `quantity` | number | Jumlah pesanan (integer). |
| `notes` | string | Catatan pelanggan (boleh kosong). |
| `unit_price` | number | Harga satuan setelah faktor bahan & ukuran. |
| `subtotal` | number | `unit_price × quantity`. |
| `discount_rate` | number | `0`, `0.05`, atau `0.1`. |
| `discount_amount` | number | Nominal diskon. |
| `total` | number | Total akhir setelah diskon. |
| `file` | file | Berkas desain (PDF/AI/PSD/PNG/JPG, maks. 25 MB). |

Contoh `PATCH /orders/:id/status`:

```json
{
  "status": "diverifikasi",
  "note": "Resolusi 300 DPI, bleed aman.",
  "reject_reason": null
}
```

Status yang valid: `menunggu`, `diverifikasi`, `diproses`, `selesai`, `ditolak`.

Respons dapat berbentuk data langsung, `{ "data": ... }`, atau `{ "order": ... }`; frontend menormalkan bentuk umum (`customer_name`, `created_at`, `total_price`, dan sejenisnya) di `src/services/api.js`. Untuk berkas, URL relatif dari API otomatis digabung dengan `VITE_API_BASE_URL`.

> Pastikan server Alif mengizinkan CORS dari origin frontend (`http://localhost:5173` saat development).

### Mereset data demo

Buka DevTools → Application → Local Storage, hapus key `faeyza.orders.v2`, lalu muat ulang halaman. Data contoh akan di-seed ulang otomatis.

---

## Fitur

### Katalog (`/`, `/katalog`)

- Pencarian client-side (nama, kategori, bahan, tag), filter kategori, dan sorting.
- Filter tersimpan di URL query (`q`, `kategori`, `sort`) sehingga bisa dibagikan.
- Skeleton loading, empty state, dan error state dengan tombol coba lagi.
- Kartu produk dengan harga mulai, minimal order, estimasi pengerjaan, dan badge.

### Detail produk (`/produk/:slug`)

- Galeri gambar dengan thumbnail, deskripsi, tabel spesifikasi, dan finishing.
- Pemilihan bahan/ukuran/kuantitas dengan estimasi harga live.
- Tombol **Pesan Sekarang** membawa spesifikasi ke formulir lewat query (`produk`, `bahan`, `ukuran`, `jumlah`).
- Produk serupa di bagian bawah.

### Formulir pesanan (`/pesan`)

- Prefill produk & spesifikasi dari halaman detail.
- Validasi per field: wajib isi, format email, format telepon Indonesia, minimal order, dan berkas.
- Unggah berkas drag-and-drop atau klik, preview nama/ukuran, hapus, dan pesan error yang jelas.
- Rincian harga Rupiah live: harga satuan × bahan × ukuran × jumlah, diskon grosir, dan total.
- Submit multipart ke API dengan progress unggah, pencegahan double-submit, dan status:
  - **loading** — form dinonaktifkan, spinner + progress.
  - **success** — kode pesanan, ringkasan, tombol **Buat Pesanan Baru**.
  - **error** — pesan server/jaringan, tombol kirim ulang, seluruh data dipertahankan.

Rumus harga (fungsi murni di `src/utils/calculatePrice.js`):

```text
harga satuan = basePrice × faktor bahan × faktor ukuran
subtotal     = harga satuan × quantity
diskon       = 5% untuk 100+ pcs, 10% untuk 500+ pcs
total        = subtotal − diskon
```

### Admin (`/admin/pesanan`)

- Metrik ringkas: total pesanan, antrean verifikasi, produksi, selesai, ditolak, dan pendapatan.
- Tabel pesanan dengan kode, pelanggan, produk, kuantitas, total, tanggal, berkas, dan badge status.
- Filter status, pencarian bebas, dan pagination (8 per halaman).
- Detail pesanan, pratinjau/unduh berkas, dan riwayat status.
- Verifikasi, mulai produksi, tandai selesai, atau tolak (alasan penolakan wajib, minimal 8 karakter).
- Perubahan status optimistis dengan rollback otomatis jika API gagal, plus toast konfirmasi.

---

## Struktur folder

```text
frontend/
├─ public/
│  ├─ files/                 # PDF contoh untuk mode demo
│  └─ images/products/       # 42 ilustrasi produk SVG (14 produk × 3)
├─ src/
│  ├─ components/
│  │  ├─ admin/              # layout admin, tabel, filter, modal status/berkas
│  │  ├─ form/               # FileUpload, QuantityStepper, PriceSummary
│  │  ├─ katalog/            # kartu produk, galeri, kategori, sorting
│  │  ├─ layout/             # header, footer, breadcrumbs, layout publik
│  │  └─ ui/                 # Button, Field, Modal, Alert, Badge, Toast, dll.
│  ├─ data/                  # produk, pesanan demo, status, konten situs
│  ├─ hooks/                 # useProducts, useOrders, usePageTitle
│  ├─ pages/                 # Catalog, ProductDetail, Order, AdminOrders, NotFound
│  ├─ services/              # api.js (axios) + mockApi.js (localStorage)
│  └─ utils/                 # calculatePrice, validation, format, cn
├─ .env.example
├─ tailwind.config.js        # token warna, tipografi, shadow dari referensi
└─ vite.config.js
```

---

## Catatan

- Panel admin pada build ini belum memiliki autentikasi. Lindungi endpoint admin di sisi API sebelum dipakai produksi.
- Semua komponen berupa function component + hooks; tidak ada UI library tambahan selain `lucide-react` untuk ikon.
- Layout mobile-first, label form eksplisit, fokus keyboard, serta `aria-*` untuk error dan progres.
- Elemen yang tidak ada di halaman referensi ditandai komentar `// TODO-DESIGN` di source.
