"use client";

import ChatView from "@/components/ChatView";

/**
 * Halaman chat AI untuk PELANGGAN.
 * Persona: Customer Assistant, riwayat terpisah dari admin.
 * Tombol "Kembali" (kiri atas) tetap ada, tombol "Tutup" (X) di header
 * percakapan dihapus sesuai permintaan.
 */
export default function CustomerChatPage() {
  return (
    <ChatView
      role="customer"
      homeHref="/dashboard"
      subtitle="Customer Assistant • OpenRouter AI"
      showCloseButton={false}
    />
  );
}
