"use client";

import ChatView from "@/components/ChatView";

/**
 * Halaman chat AI untuk ADMIN / OPERATOR (AI Copilot).
 * Persona: Admin Copilot, riwayat terpisah dari pelanggan.
 * Akses(route /admin/*) dijaga middleware.ts.
 */
export default function AdminChatPage() {
  return (
    <ChatView
      role="admin"
      homeHref="/admin/dashboard"
      subtitle="Admin Copilot • OpenRouter AI"
    />
  );
}
