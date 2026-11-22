"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatView from "@/components/ChatView";

/**
 * Halaman chat AI untuk PELANGGAN.
 * Persona: Customer Assistant, riwayat terpisah dari admin.
 * Tombol "Kembali" (kiri atas) tetap ada, tombol "Tutup" (X) di header
 * percakapan dihapus sesuai permintaan.
 */
function CustomerChatContent() {
  const searchParams = useSearchParams();
  const isAiMode = searchParams.get("mode") === "ai";

  return (
    <ChatView
      role="customer"
      homeHref="/dashboard"
      channel={isAiMode ? "ai" : "cs"}
      subtitle={isAiMode ? "Chatbot AI Faeyza" : "Live Chat Customer Service"}
      showCloseButton={false}
    />
  );
}

export default function CustomerChatPage() {
  return (
    <Suspense fallback={null}>
      <CustomerChatContent />
    </Suspense>
  );
}
