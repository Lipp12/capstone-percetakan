// components/ChatBox.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Role } from "@/lib/ai";

export type Msg = {
  role: "user" | "assistant";
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  role: Role;
  messages: Msg[];
  createdAt: number;
  updatedAt: number;
};

interface ChatBoxProps {
  role?: Role;
  onRoleChange?: (role: Role) => void;
  onClose?: () => void;
}

const getStorageKey = (r: Role) => `capstone_chat_sessions_${r}_v3`;
const getActiveKey = (r: Role) => `capstone_chat_active_id_${r}_v3`;

function createNewSession(role: Role = "customer"): ChatSession {
  const now = Date.now();
  return {
    id: `chat_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: "Percakapan Baru",
    role,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function deriveTitle(content: string): string {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 26) return cleaned;
  return cleaned.slice(0, 26) + "...";
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export default function ChatBox({
  role = "customer",
  onRoleChange,
  onClose,
}: ChatBoxProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // State untuk modal konfirmasi hapus
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    mode: "single" | "all";
    sessionId?: string;
    sessionTitle?: string;
  }>({
    isOpen: false,
    mode: "single",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Muat data dari localStorage khusus untuk role ini (Admin / Customer terpisah)
  useEffect(() => {
    setIsMounted(true);
    const storageKey = getStorageKey(role);
    const activeKey = getActiveKey(role);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const savedActiveId = localStorage.getItem(activeKey);
          const exists = parsed.some((s) => s.id === savedActiveId);
          const activeId = exists && savedActiveId ? savedActiveId : parsed[0].id;
          setActiveSessionId(activeId);
          return;
        }
      }
    } catch (e) {
      console.error("Gagal membaca history dari localStorage:", e);
    }

    // Default jika belum ada riwayat sama sekali untuk role ini
    const initial = createNewSession(role);
    setSessions([initial]);
    setActiveSessionId(initial.id);
  }, [role]);

  // 2. Simpan ke localStorage khusus untuk role ini
  useEffect(() => {
    if (!isMounted || sessions.length === 0) return;
    const storageKey = getStorageKey(role);
    const activeKey = getActiveKey(role);

    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem(activeKey, activeSessionId);
      }
    } catch (e) {
      console.error("Gagal menyimpan history ke localStorage:", e);
    }
  }, [sessions, activeSessionId, isMounted, role]);

  // Sesi aktif saat ini
  const activeSession = useMemo(() => {
    return (
      sessions.find((s) => s.id === activeSessionId) || sessions[0] || null
    );
  }, [sessions, activeSessionId]);

  // Auto-scroll ke bawah saat ada pesan baru atau loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, loading]);

  // Filter daftar history berdasarkan search query (mencari judul & isi pesan)
  const filteredSessions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sessions;
    return sessions.filter((s) => {
      const titleMatch = s.title.toLowerCase().includes(q);
      const messageMatch = s.messages.some((m) =>
        m.content.toLowerCase().includes(q)
      );
      return titleMatch || messageMatch;
    });
  }, [sessions, searchQuery]);

  // Buat sesi chat baru
  function handleNewChat() {
    const newSession = createNewSession(role);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
    setInput("");
  }

  // Pilih sesi percakapan dari daftar history
  function handleSelectSession(session: ChatSession) {
    setActiveSessionId(session.id);
    if (onRoleChange && session.role) {
      onRoleChange(session.role);
    }
    setIsSidebarOpen(false);
  }

  // Buka dialog konfirmasi hapus 1 sesi
  function handleOpenDeleteSingle(session: ChatSession, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      mode: "single",
      sessionId: session.id,
      sessionTitle: session.title,
    });
  }

  // Buka dialog konfirmasi hapus semua sesi
  function handleOpenDeleteAll() {
    setDeleteModal({
      isOpen: true,
      mode: "all",
    });
  }

  // Eksekusi penghapusan setelah user konfirmasi "Ya, Hapus"
  function confirmDelete() {
    if (deleteModal.mode === "single" && deleteModal.sessionId) {
      const targetId = deleteModal.sessionId;
      const updated = sessions.filter((s) => s.id !== targetId);

      if (updated.length === 0) {
        const fresh = createNewSession(role);
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      } else {
        setSessions(updated);
        if (activeSessionId === targetId) {
          setActiveSessionId(updated[0].id);
          if (onRoleChange && updated[0].role) {
            onRoleChange(updated[0].role);
          }
        }
      }
    } else if (deleteModal.mode === "all") {
      const fresh = createNewSession(role);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setSearchQuery("");
    }

    setDeleteModal({ isOpen: false, mode: "single" });
  }

  // Kirim pesan ke API AI
  async function send() {
    if (!input.trim() || loading || !activeSession) return;

    const userText = input.trim();
    const userMsg: Msg = { role: "user", content: userText };
    const currentMessages = activeSession.messages;
    const newMessages = [...currentMessages, userMsg];

    // Otomatis ubah judul sesi dari pesan pertama
    const updatedTitle =
      activeSession.title === "Percakapan Baru" || currentMessages.length === 0
        ? deriveTitle(userText)
        : activeSession.title;

    // Perbarui state secara optimistik
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: updatedTitle,
              role,
              messages: newMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg: Msg = {
          role: "assistant",
          content: `**Kendala:** ${
            data.error || "Gagal mendapatkan respon dari AI."
          }`,
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: [...newMessages, errMsg],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      } else {
        const replyMsg: Msg = {
          role: "assistant",
          content: data.reply || "Maaf, tidak ada balasan dari asisten.",
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: [...newMessages, replyMsg],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      const failMsg: Msg = {
        role: "assistant",
        content:
          "⚠️ **Koneksi ke AI gagal.** Periksa koneksi internet atau periksa API Key OpenRouter Anda di `.env.local`.",
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [...newMessages, failMsg],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = (activeSession?.role || role) === "admin";

  return (
    <div className="relative flex flex-col md:flex-row w-full max-w-5xl h-[620px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      {/* ===================== SIDEBAR RIWAYAT CHAT ===================== */}
      <aside
        className={`absolute md:static inset-y-0 left-0 z-30 w-72 sm:w-80 bg-slate-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "translate-x-0 shadow-2xl md:shadow-none"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header Sidebar: Judul & Tombol Chat Baru */}
        <div className="p-4 border-b border-gray-200/80 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </span>
              <h2 className="font-semibold text-gray-800 text-sm">
                Riwayat Chat
              </h2>
            </div>

            {/* Tombol Tutup Sidebar di Layar Mobile */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tombol Chat Baru */}
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium py-2 px-3 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Chat Baru</span>
          </button>
        </div>

        {/* Search Bar untuk Cari History Chat */}
        <div className="p-3 border-b border-gray-200/80 bg-slate-50">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari history chat..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="text-[11px] text-gray-500 mt-1.5 px-1">
              Ditemukan {filteredSessions.length} percakapan
            </div>
          )}
        </div>

        {/* Daftar Sesi Riwayat Chat */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 px-4">
              <svg
                className="w-8 h-8 mb-2 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-xs">
                {searchQuery
                  ? "Tidak ada riwayat yang cocok"
                  : "Belum ada riwayat chat"}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSession?.id;
              const isCust = session.role === "customer";

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-left border ${
                    isActive
                      ? "bg-white border-blue-500 shadow-xs"
                      : "bg-transparent border-transparent hover:bg-white/80 hover:border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                          isCust
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {isCust ? "Customer" : "Admin"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {formatTimestamp(session.updatedAt || session.createdAt)}
                      </span>
                    </div>

                    <p
                      className={`text-xs font-medium truncate mt-1 ${
                        isActive ? "text-blue-900" : "text-gray-800"
                      }`}
                    >
                      {session.title}
                    </p>

                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {session.messages.length > 0
                        ? `${session.messages.length} pesan`
                        : "Percakapan kosong"}
                    </p>
                  </div>

                  {/* Tombol Hapus per Item Riwayat */}
                  <button
                    type="button"
                    title="Hapus history chat ini"
                    onClick={(e) => handleOpenDeleteSingle(session, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition opacity-80 group-hover:opacity-100"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Sidebar: Tombol Hapus Semua History */}
        {sessions.length > 0 && (
          <div className="p-3 border-t border-gray-200/80 bg-white">
            <button
              type="button"
              onClick={handleOpenDeleteAll}
              className="w-full py-1.5 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Hapus Semua Riwayat</span>
            </button>
          </div>
        )}
      </aside>

      {/* Backdrop overlay saat sidebar terbuka di mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-2xs md:hidden"
        />
      )}

      {/* ===================== AREA UTAMA CHAT ===================== */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Header Chat */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            {/* Tombol buka drawer riwayat di mobile */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              title="Buka Riwayat Chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAdmin ? "bg-purple-600" : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {activeSession?.title || "Percakapan Baru"}
                </h3>
              </div>
              <p className="text-[11px] text-gray-400">
                {isAdmin ? "Mode Admin Copilot" : "Mode Customer Assistant"} • OpenRouter AI
              </p>
            </div>
          </div>

          {/* Tombol Tutup / Close (X) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-gray-200/80 shadow-2xs shrink-0"
              title="Tutup Chat"
            >
              <span className="hidden sm:inline">Tutup</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </header>

        {/* Area Pesan Chat */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gray-50/40">
          {(!activeSession || activeSession.messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-4 py-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>

              <h4 className="font-semibold text-gray-700 text-sm mb-1">
                {isAdmin
                  ? "Admin Copilot Siap Membantu"
                  : "Halo! Butuh bantuan cetak apa hari ini?"}
              </h4>

              <p className="text-xs text-gray-400 max-w-sm mb-4">
                {isAdmin
                  ? "Tanyakan ringkasan pesanan, draft balasan ke pelanggan, atau tips kelola stok cetak."
                  : "Tanyakan rekomendasi bahan spanduk/banner, estimasi pengerjaan, atau panduan ukuran cetak."}
              </p>

              {/* Rekomendasi Pertanyaan Cepat */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
                {(isAdmin
                  ? [
                      "Buatkan draft konfirmasi pesanan banner",
                      "Bagaimana cara tracking pengiriman cetak?",
                    ]
                  : [
                      "Bahan apa yang tahan air untuk outdoor?",
                      "Berapa ukuran standar kartu nama?",
                      "Berapa lama proses cetak spanduk?",
                    ]
                ).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="text-xs bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200/80 px-2.5 py-1.5 rounded-lg transition shadow-2xs text-left"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSession?.messages.map((m, i) => {
            const isUser = m.role === "user";

            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[88%] sm:max-w-[80%] break-words shadow-2xs ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-0.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2 space-y-0.5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-snug">{children}</li>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 text-blue-700 text-xs px-1 py-0.5 rounded font-mono">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {m.content.replace(/\[EXPORT:excel:[a-zA-Z0-9_-]+\]/g, "")}
                      </ReactMarkdown>

                      {/* Deteksi tag [EXPORT:excel:period] */}
                      {(() => {
                        const exportMatch = m.content.match(/\[EXPORT:excel:([a-zA-Z0-9_-]+)\]/);
                        if (exportMatch) {
                          const period = exportMatch[1];
                          return (
                            <div className="mt-3 pt-2.5 border-t border-gray-100">
                              <a
                                href={`/api/export/excel?period=${period}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Unduh Laporan Excel ({period})</span>
                              </a>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-xs italic py-1 px-2">
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              </span>
              <span>AI sedang mengetik...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Pesan */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <input
              className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={
                isAdmin
                  ? "Tanyakan ringkasan pesanan atau draft admin..."
                  : "Tanya produk atau bahan cetak..."
              }
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium px-4 sm:px-5 py-2.5 rounded-xl text-sm transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>Kirim</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* ===================== MODAL KONFIRMASI HAPUS ===================== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 transform transition-all">
            {/* Icon Tempat Sampah / Alert */}
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h3 className="text-base font-bold text-gray-900 text-center mb-1.5">
              {deleteModal.mode === "all"
                ? "Hapus Semua Riwayat Chat?"
                : "Hapus Riwayat Chat?"}
            </h3>

            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              {deleteModal.mode === "all"
                ? "Apakah Anda yakin ingin menghapus seluruh history chat? Semua riwayat percakapan akan dihapus secara permanen."
                : `Apakah Anda yakin ingin menghapus history chat "${
                    deleteModal.sessionTitle || "percakapan ini"
                  }"? Percakapan yang sudah dihapus tidak dapat dipulihkan.`}
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, mode: "single" })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-md shadow-red-200 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}