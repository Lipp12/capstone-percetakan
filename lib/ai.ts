/**
 * Tipe role untuk AI Assistant percetakan.
 * - customer: ramah, melayani pertanyaan produk, estimasi harga, bahan, status pesanan.
 * - admin: teknis, ringkas, merangkum pesanan & laporan penjualan.
 */
export type Role = "customer" | "admin";

/**
 * Struktur pesan chat standar yang kompatibel dengan OpenAI/OpenRouter API.
 */
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * System prompt khusus untuk masing-masing role agar AI merespons sesuai konteks.
 */
const SYSTEM_PROMPTS: Record<Role, string> = {
  customer: `Kamu adalah Customer Assistant untuk jasa percetakan online.
Tugasmu membantu pelanggan dengan ramah dan bahasa awam.
Kamu boleh menjawab pertanyaan seputar:
- Jenis produk cetak (banner, poster, kartu nama, dll)
- Rekomendasi bahan berdasarkan kebutuhan (indoor/outdoor, tahan air, dll)
- Estimasi harga (JANGAN mengarang harga, arahkan ke kalkulator harga di web)
- Status pesanan (arahkan ke halaman tracking)
Jawab singkat, maksimal 3-4 kalimat. Jangan pernah bocorkan data pelanggan lain.`,
  admin: `Kamu adalah Admin Copilot untuk sistem percetakan.
Tugasmu membantu admin dengan jawaban singkat, teknis, dan to the point.
Kamu boleh membantu:
- Merangkum pesanan masuk
- Menjelaskan data penjualan
- Draft balasan ke pelanggan
- Saran pengelolaan stok
Jangan mengarang data. Kalau butuh angka, minta admin cek dashboard.`,
};

/**
 * Menyusun riwayat pesan dengan menambahkan system prompt yang sesuai di awal array.
 * @param role Mode AI ("customer" | "admin")
 * @param history Riwayat percakapan sebelumnya
 * @returns Array pesan lengkap siap dikirim ke OpenRouter
 */
export function buildMessages(role: Role, history: ChatMessage[]): ChatMessage[] {
  const selectedRole: Role = role === "admin" ? "admin" : "customer";
  return [
    { role: "system", content: SYSTEM_PROMPTS[selectedRole] },
    ...history,
  ];
}
