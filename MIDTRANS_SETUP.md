# Setup Midtrans Snap (Sandbox)

Halaman **Pilih Saluran Pembayaran** menampilkan banyak metode: QRIS, GoPay,
ShopeePay, Transfer BRI/Mandiri/BCA/BNI, VA lainnya, kartu kredit/debit, gerai
retail, dan "Semua Metode Midtrans". Semuanya dijalankan Midtrans Snap lewat
parameter `enabled_payments`. Memilih salah satu langsung membuka flow metode itu
di popup Midtrans — tidak ada nomor rekening statis atau upload bukti manual.
Tampilan checkout tetap mengikuti gaya semula (kartu metode di kiri, ringkasan
pesanan + tombol konfirmasi di kanan).

**Uang tetap masuk ke toko.** Pelanggan hanya memilih *cara bayar*. Midtrans yang
menampung dan menyetorkan dananya ke akun merchant toko — **rekening BRI** dan
**saldo GoPay** — sesuai jadwal settlement. Tidak perlu memetakan tiap metode ke
rekening berbeda.

Begitu status dari Midtrans lunas, server otomatis:

1. menulis riwayat status `PAID`,
2. membuat transaksi pemasukan,
3. melanjutkan status ke `DESIGN_CHECKING` (step pengecekan desain),
4. halaman tracking di-refresh otomatis.

Tidak ada lagi "nunggu konfirmasi bayar" manual.

## 1. Dapatkan kredensial sandbox

1. Daftar / login ke [Midtrans MAP](https://dashboard.midtrans.com/).
2. Pastikan environment **Sandbox** aktif (panel kiri atas).
3. Buka **Settings → Access Keys**.
4. Salin:
   - **Client Key** (awalan `SB-Mid-client-`)
   - **Server Key** (awalan `SB-Mid-server-`)
   - **Signature Secret Key** (kalau tersedia di akunmu)

## 2. Isi `.env`

Salin variabel di bawah ke file `.env` (sejajar dengan `.env.example`):

```env
MIDTRANS_SERVER_KEY="SB-Mid-server-...."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-...."
MIDTRANS_SIGNATURE_SECRET_KEY="..."     # boleh dikosongkan untuk akun lama
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` dan `NEXT_PUBLIC_SITE_URL` dibutuhkan saat
> **build**. Kalau di-deploy, isi juga di Environment Variables platform (Railway,
> Vercel, dll).
>
> **Client Key boleh kosong.** Kalau tidak diisi, checkout otomatis memakai
> halaman pembayaran Midtrans (Snap redirect), jadi pesan error
> "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum diisi" tidak muncul lagi. Isi Client Key
> kalau ingin popup Snap di halaman yang sama. **Server Key tetap wajib diisi**
> karena dipakai server untuk membuat transaksi.

Restart server setelah mengubah `.env`. Kalau menjalankan `npm run build` lalu
`npm start`, lakukan **build ulang** setelah mengubah variabel `NEXT_PUBLIC_*`
(nilainya ditanam di bundle saat build). Untuk `npm run dev`, cukup restart dev
server.

## 3. Daftarkan rekening BRI & GoPay untuk settlement

Di Midtrans MAP, buka **Settings → Configuration → Bank Account / Settlement**
(label bisa sedikit beda tergantung versi MAP):

1. Tambahkan **rekening bank BRI** atas nama toko sebagai rekening pencairan
   (settlement bank transfer, termasuk hasil VA dan QRIS).
2. Pastikan **akun GoPay merchant** toko terhubung, agar transaksi GoPay masuk ke
   saldo GoPay toko.
3. Di **Settings → Snap Preferences → Payment Channels**, aktifkan kanal yang
   mau ditampilkan: QRIS (butuh GoPay/ShopeePay QRIS aktif), GoPay, ShopeePay,
   BRI VA, Mandiri Bill Payment, BCA VA, BNI VA, Permata/CIMB VA, kartu kredit,
   dan Indomaret.

Kalau suatu kanal tidak aktif di MAP, Snap akan menolak token untuk kanal itu —
jadi pastikan semuanya sudah dicentang.

## 4. Pasang Notification URL (webhook)

Di Midtrans MAP: **Settings → Configuration → Payment Notification URL**

```
https://<domain-anda>/api/payments/notification
```

Untuk lokal bisa pakai tunneling (ngrok/cloudflared), misalnya:

```
https://abc-123.ngrok-free.app/api/payments/notification
```

Webhook sudah diverifikasi dengan signature (`SHA512(order_id + status_code +
gross_amount + secret)`), idempoten, dan hanya memproses `settlement`/`capture`
dengan `fraud_status: accept`.

## 5. Cara test

1. Buat pesanan sampai halaman checkout.
2. Pilih metode apa pun (misalnya **GoPay** atau **Transfer Bank BRI**), lalu
   klik **Konfirmasi Pembayaran**.
3. Popup Snap langsung membuka metode yang dipilih. Selesaikan pembayaran simulasi
   di halaman Midtrans (QRIS → pindai QR sandbox; VA → kode bayar sandbox;
   GoPay → alur sandbox).
4. Setelah `onSuccess`, server mengecek status ke Midtrans, lalu browser diarahkan
   ke halaman tracking dengan step **Pengecekan Desain** sedang berjalan.
5. Cek di halaman admin **Pesanan → Cek Desain**: pesanan muncul dengan status
   `DESIGN_CHECKING` dan bisa langsung di-ACC.
6. Di MAP → **Transactions**, cek transaksi sandbox muncul; di menu settlement
   cek dana masuk ke rekening BRI / saldo GoPay sesuai jadwal (di sandbox
   biasanya simulated settlement).

## 6. Catatan penting

- Status `PAID` sengaja tetap ditulis ke `statusHistory` walaupun status akhir
  berubah ke `DESIGN_CHECKING`. Ini adalah bukti lunas yang dipakai
  `lib/order-rules.ts` sebelum pesanan boleh masuk Kanban produksi.
- Daftar saluran dan kode `enabled_payments`-nya ada di
  `lib/midtrans-channels.ts`. Tambah/edit kanal di file itu kalau mau mengubah
  pilihan di checkout.
- Opsi **Semua Metode Midtrans** tidak mengirim `enabled_payments`, jadi Snap
  menampilkan semua kanal yang aktif di akun toko.
- Token Snap di-cache per kanal di `sessionStorage`, jadi ganti metode tidak
  memakai token lama dan klik ulang tidak error duplikat `order_id`.
- Kalau kredensial belum diisi, halaman checkout akan menampilkan pesan error
  yang jelas, bukan popup yang gagal diam-diam.
- `provider` di `prisma/schema.prisma` sudah dikembalikan ke `postgresql`
  (sesuai `DATABASE_URL` Neon dan file migrasi yang ada). Jalankan
  `npx prisma generate` setelah mengubah environment.
