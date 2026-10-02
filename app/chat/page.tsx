"use client";

import ChatView from "@/components/ChatView";

/**
 * Halaman chat AI untuk PELANGGAN.
 * Persona: Customer Assistant, riwayat terpisah dari admin.
 */
export default function CustomerChatPage() {
  return (
    <ChatView
      role="customer"
      homeHref="/dashboard"
      subtitle="Customer Assistant • OpenRouter AI"
    />
  );
}
