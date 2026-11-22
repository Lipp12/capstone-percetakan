"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Role } from "@/lib/ai";
import { cn, formatRupiah } from "@/lib/utils";
import {
  Bot,
  CheckCircle2,
  Clock3,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export type Msg = { role: "user" | "assistant"; content: string };

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
  channel?: "cs" | "ai";
  onRoleChange?: (role: Role) => void;
  onClose?: () => void;
  fill?: boolean;
}

const getStorageKey = (role: Role, channel: "cs" | "ai") =>
  `capstone_chat_sessions_${role}_${channel}_v4`;
const getActiveKey = (role: Role, channel: "cs" | "ai") =>
  `capstone_chat_active_id_${role}_${channel}_v4`;

function createNewSession(role: Role): ChatSession {
  const now = Date.now();
  return {
    id: `chat_${now}_${Math.random().toString(36).slice(2, 7)}`,
    title: "Percakapan Baru",
    role,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function deriveTitle(content: string) {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length <= 26 ? clean : `${clean.slice(0, 26)}...`;
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const today =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return today
    ? date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ChatBox({
  role = "customer",
  channel = "cs",
  onRoleChange,
  onClose,
  fill = false,
}: ChatBoxProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    mode: "single" | "all";
    id?: string;
    title?: string;
  }>({ open: false, mode: "single" });
  const searchParams = useSearchParams();
  const [chatContext, setChatContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(getStorageKey(role, channel));
      if (saved) {
        const parsed = JSON.parse(saved) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length) {
          setSessions(parsed);
          const savedActive = localStorage.getItem(getActiveKey(role, channel));
          setActiveSessionId(parsed.some((item) => item.id === savedActive) && savedActive
            ? savedActive
            : parsed[0].id);
          return;
        }
      }
    } catch (error) {
      console.error("Gagal membaca riwayat chat:", error);
    }
    const initial = createNewSession(role);
    setSessions([initial]);
    setActiveSessionId(initial.id);
  }, [role, channel]);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const productId = searchParams.get("productId");
    if (!orderId && !productId) {
      setChatContext(null);
      return;
    }

    const params = new URLSearchParams();
    if (orderId) params.set("orderId", orderId);
    if (productId) params.set("productId", productId);

    fetch(`/api/chat/context?${params.toString()}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setChatContext(data))
      .catch(() => setChatContext(null));
  }, [searchParams]);

  useEffect(() => {
    if (!mounted || !sessions.length) return;
    localStorage.setItem(getStorageKey(role, channel), JSON.stringify(sessions));
    if (activeSessionId) localStorage.setItem(getActiveKey(role, channel), activeSessionId);
  }, [sessions, activeSessionId, mounted, role, channel]);

  const activeSession = useMemo(
    () => sessions.find((item) => item.id === activeSessionId) || sessions[0] || null,
    [sessions, activeSessionId],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, loading]);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return sessions;
    return sessions.filter(
      (session) =>
        session.title.toLowerCase().includes(query) ||
        session.messages.some((message) => message.content.toLowerCase().includes(query)),
    );
  }, [sessions, searchQuery]);

  function handleNewChat() {
    const fresh = createNewSession(role);
    setSessions((previous) => [fresh, ...previous]);
    setActiveSessionId(fresh.id);
    setSidebarOpen(false);
  }

  function confirmDelete() {
    if (deleteModal.mode === "all") {
      const fresh = createNewSession(role);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setSearchQuery("");
    } else if (deleteModal.id) {
      const remaining = sessions.filter((session) => session.id !== deleteModal.id);
      if (!remaining.length) {
        const fresh = createNewSession(role);
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      } else {
        setSessions(remaining);
        if (activeSessionId === deleteModal.id) setActiveSessionId(remaining[0].id);
      }
    }
    setDeleteModal({ open: false, mode: "single" });
  }

  async function send() {
    if (!input.trim() || loading || !activeSession) return;
    const userText = input.trim();
    const userMessage: Msg = { role: "user", content: userText };
    const currentMessages = activeSession.messages;
    const nextMessages = [...currentMessages, userMessage];
    const nextTitle =
      activeSession.title === "Percakapan Baru" || !currentMessages.length
        ? deriveTitle(userText)
        : activeSession.title;

    setSessions((previous) =>
      previous.map((session) =>
        session.id === activeSession.id
          ? { ...session, title: nextTitle, role, messages: nextMessages, updatedAt: Date.now() }
          : session,
      ),
    );
    setInput("");

    if (channel === "cs" && role === "customer") {
      const adminPendingMessage: Msg = {
        role: "assistant",
        content:
          "Pesan Anda sudah diterima oleh sistem. Admin CS akan membalas percakapan ini pada jam operasional.",
      };
      setSessions((previous) =>
        previous.map((session) =>
          session.id === activeSession.id
            ? {
                ...session,
                messages: [...nextMessages, adminPendingMessage],
                updatedAt: Date.now(),
              }
            : session,
        ),
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, role }),
      });
      const data = await response.json();
      const reply: Msg = response.ok
        ? { role: "assistant", content: data.reply || "Maaf, tidak ada balasan dari asisten." }
        : { role: "assistant", content: `**Kendala:** ${data.error || "Gagal mendapatkan respon dari AI."}` };
      setSessions((previous) =>
        previous.map((session) =>
          session.id === activeSession.id
            ? { ...session, messages: [...nextMessages, reply], updatedAt: Date.now() }
            : session,
        ),
      );
    } catch (error) {
      console.error("Chat error:", error);
      setSessions((previous) =>
        previous.map((session) =>
          session.id === activeSession.id
            ? {
                ...session,
                messages: [
                  ...nextMessages,
                  { role: "assistant", content: "⚠️ **Koneksi ke AI gagal.** Periksa koneksi internet atau konfigurasi API AI." },
                ],
              }
            : session,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = role === "admin";
  const quickPrompts = isAdmin
    ? ["Buatkan draft konfirmasi pesanan", "Bagaimana status produksi pesanan?", "Ringkas pesanan yang perlu diproses"]
    : channel === "ai"
      ? ["Rekomendasikan bahan untuk brosur outdoor", "Berapa lama cetak stiker?", "Bantu hitung estimasi cetak"]
      : ["Lihat status pesanan saya", "Ajukan revisi desain", "Tanya konfirmasi pembayaran"];

  return (
    <div className={cn(
      "relative grid min-h-0 overflow-hidden border border-outline-variant/50 bg-surface-container-lowest shadow-[0_8px_24px_rgba(160,120,100,0.10)]",
      fill ? "h-full w-full rounded-2xl" : "h-[620px] w-full max-w-5xl rounded-2xl",
      role === "customer" && channel === "cs" && "sm:grid-cols-[180px_minmax(0,1fr)_180px]",
      role === "customer" && channel === "ai" && "sm:grid-cols-[180px_minmax(0,1fr)_220px]",
      role === "admin" && "md:grid-cols-[260px_minmax(0,1fr)]",
    )}>
      {role === "customer" && (channel === "cs" || channel === "ai") && (
        <aside className={cn(
          "absolute inset-y-0 left-0 z-30 w-72 flex-col border-r border-outline-variant/40 bg-surface-container-low sm:static sm:w-[180px] sm:flex",
          sidebarOpen ? "flex" : "hidden",
          !fill && "md:flex",
        )}>
          <div className="border-b border-outline-variant/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <MessageCircle className="h-4 w-4 text-primary" /> Riwayat Chat
              </h2>
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-1 md:hidden" aria-label="Tutup riwayat">
                <X className="h-4 w-4" />
              </button>
            </div>
            <button type="button" onClick={handleNewChat} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-3 py-2.5 text-xs font-bold text-on-primary-container shadow-[2px_2px_0px_#2D2926]">
              <Plus className="h-4 w-4" /> Chat Baru
            </button>
          </div>
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari percakapan..." className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-2 pl-9 pr-3 text-xs outline-none" />
            </div>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
            {filteredSessions.map((session) => (
              <div key={session.id} onClick={() => { setActiveSessionId(session.id); onRoleChange?.(session.role); setSidebarOpen(false); }} className={cn(
                "group flex cursor-pointer items-center justify-between rounded-xl border p-3",
                activeSessionId === session.id ? "border-primary-fixed-dim bg-primary-container/30" : "border-transparent hover:bg-surface-container-lowest",
              )}>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-on-surface">{session.title}</p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">{formatTimestamp(session.updatedAt)} • {session.messages.length} pesan</p>
                </div>
                <button type="button" onClick={(event) => { event.stopPropagation(); setDeleteModal({ open: true, mode: "single", id: session.id, title: session.title }); }} className="ml-2 p-1.5 text-outline opacity-60 hover:text-error" aria-label="Hapus percakapan">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {sessions.length > 0 && (
            <button type="button" onClick={() => setDeleteModal({ open: true, mode: "all" })} className="m-3 flex items-center justify-center gap-2 rounded-lg border border-error/20 py-2 text-[11px] font-bold text-error hover:bg-error-container/30">
              <Trash2 className="h-3.5 w-3.5" /> Hapus Semua Riwayat
            </button>
          )}
        </aside>
      )}

      {sidebarOpen && role === "customer" && (channel === "cs" || channel === "ai") && (
        <button type="button" className="absolute inset-0 z-20 bg-inverse-surface/20 sm:hidden" onClick={() => setSidebarOpen(false)} aria-label="Tutup overlay" />
      )}

      {role === "admin" && (
        <aside className="hidden flex-col border-r border-outline-variant/40 bg-surface-container-low md:flex">
          <div className="border-b border-outline-variant/40 p-4">
            <button type="button" onClick={handleNewChat} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-xs font-bold text-white">
              <Plus className="h-4 w-4" /> Percakapan Baru
            </button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {sessions.map((session) => (
              <button key={session.id} type="button" onClick={() => setActiveSessionId(session.id)} className={cn("w-full rounded-lg p-3 text-left", activeSessionId === session.id ? "bg-white shadow-sm" : "hover:bg-white/70")}>
                <p className="truncate text-xs font-bold text-on-surface">{session.title}</p>
                <p className="mt-1 text-[10px] text-on-surface-variant">{formatTimestamp(session.updatedAt)}</p>
              </button>
            ))}
          </div>
        </aside>
      )}

      <section className="flex min-h-0 flex-col overflow-hidden bg-surface-container-lowest">
        <header className="flex items-center justify-between border-b border-outline-variant/40 px-4 py-3">
          <div className="flex items-center gap-3">
            {role === "customer" && (channel === "cs" || channel === "ai") && (
              <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-surface-container sm:hidden" aria-label="Buka riwayat">
                <Menu className="h-4 w-4" />
              </button>
            )}
            {channel === "ai" ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
                <Bot className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-container p-1.5">
                <Image
                  src="/cs-support-avatar.png"
                  alt="Faeyza CS"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-on-surface">
                  {isAdmin ? "Faeyza Copilot" : channel === "ai" ? "Chatbot AI Faeyza" : "Faeyza CS"}
                </h3>
                <span className="h-2 w-2 rounded-full bg-tertiary" />
              </div>
              <p className="mt-0.5 text-[10px] font-bold text-tertiary">
                {channel === "ai" ? "AI aktif • bantuan otomatis 24/7" : "Online • biasanya membalas 1-2 menit"}
              </p>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant/50 px-2.5 py-2 text-xs font-bold text-on-surface-variant">
              <X className="h-4 w-4" />
            </button>
          )}
        </header>

        <div className="chat-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {(!activeSession || activeSession.messages.length === 0) && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/60 text-primary">
                <Bot className="h-7 w-7" />
              </div>
              <h4 className="font-epilogue text-sm font-bold text-on-surface">
                {isAdmin
                  ? "Admin Copilot Siap Membantu"
                  : channel === "ai"
                    ? "Halo! Saya asisten AI Faeyza"
                    : "Halo! Ada yang bisa Admin CS bantu?"}
              </h4>
              <p className="mt-1 max-w-sm text-xs text-on-surface-variant">
                Tanyakan rekomendasi bahan, estimasi pengerjaan, atau panduan ukuran cetak.
              </p>
              <div className="mt-4 flex max-w-lg flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => setInput(prompt)} className="rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:bg-primary-container/30">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSession?.messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div key={index} className={cn("mb-3 flex", isUser ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[78%]",
                  isUser ? "rounded-br-md bg-primary text-on-primary" : "rounded-bl-md border border-outline-variant/40 bg-surface-container-low text-on-surface",
                )}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content.replace(/\[EXPORT:excel:[a-zA-Z0-9_-]+\]/g, "")}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="mb-3 flex items-center gap-2 rounded-full bg-surface-container px-3 py-2 text-[11px] text-on-surface-variant w-fit">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:.3s]" />
              </span>
              {channel === "ai" ? "AI Faeyza sedang menjawab" : "Pesan dikirim ke Admin CS"}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-outline-variant/40 bg-surface-container-lowest p-3 sm:p-4">
          <form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex items-center gap-2">
            <button type="button" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/50 text-outline sm:flex" title="Lampirkan file">
              <Upload className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
              placeholder={channel === "ai" ? "Tanya Chatbot AI Faeyza..." : "Ketik pesan untuk Admin CS..."}
              className="min-w-0 flex-1 rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
            />
            <button type="submit" disabled={loading || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cetak-orange text-white shadow-[3px_3px_0px_#2D2926] disabled:opacity-50" aria-label="Kirim pesan">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {role === "customer" && channel === "cs" && (
        <aside className="hidden flex-col gap-3 border-l border-outline-variant/40 bg-surface-container-low p-3 sm:flex">
          {chatContext && (
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-on-surface">
                  {chatContext.type === "order" ? "Pesanan Terkait" : "Produk Terkait"}
                </span>
              </div>
              <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-3">
                <p className="text-[10px] font-bold text-primary">
                  {chatContext.type === "order"
                    ? `#${chatContext.orderNumber}`
                    : "Produk Cetak"}
                </p>
                <p className="mt-1 text-xs font-bold leading-snug text-on-surface">
                  {chatContext.productName}
                </p>
                {chatContext.materialName && (
                  <p className="mt-1 text-[10px] text-on-surface-variant">
                    {chatContext.materialName}
                  </p>
                )}
                {chatContext.quantity != null && (
                  <p className="mt-1 text-[10px] text-on-surface-variant">
                    {chatContext.quantity} {chatContext.unit}
                    {chatContext.width && chatContext.height
                      ? ` • ${chatContext.width} × ${chatContext.height} m`
                      : ""}
                  </p>
                )}
                {chatContext.status && (
                  <span className="mt-2 inline-flex rounded-full bg-primary-container/60 px-2 py-1 text-[9px] font-bold text-on-primary-container">
                    {chatContext.status.replaceAll("_", " ")}
                  </span>
                )}
                {(chatContext.totalPrice || chatContext.basePrice) && (
                  <p className="mt-2 text-sm font-bold text-on-surface">
                    {formatRupiah(chatContext.totalPrice || chatContext.basePrice)}
                  </p>
                )}
                <Link
                  href={chatContext.detailUrl}
                  className="mt-3 block rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-center text-[10px] font-bold text-on-surface"
                >
                  {chatContext.type === "order" ? "Lihat Pesanan" : "Lihat Detail Produk"}
                </Link>
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-on-surface">Topik Cepat Konsultasi</span>
            </div>
            <div className="space-y-2">
              {["Status Pesanan Aktif", "Revisi & Desain", "Bahan & Kuantitas Kertas", "Konfirmasi Workshop"].map((topic, index) => (
                <button key={topic} type="button" onClick={() => setInput(topic)} className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-[11px] font-bold",
                  ["bg-primary-container/60 text-on-primary-container", "bg-secondary-fixed/70 text-on-secondary-fixed", "bg-tertiary-container/60 text-on-tertiary-container", "bg-secondary-container/50 text-on-secondary-container"][index],
                )}>
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-on-surface">
              <Clock3 className="h-4 w-4 text-tertiary" /> Jam Layanan Studio
            </div>
            <p className="mt-3 text-xs font-bold text-on-surface">10.00 - 20.00 WIB</p>
            <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant">Pesan di luar jam kerja akan dibalas pada hari operasional berikutnya.</p>
          </div>
        </aside>
      )}

      {role === "customer" && channel === "ai" && (
        <aside className="hidden flex-col gap-3 border-l border-outline-variant/40 bg-surface-container-low p-3 sm:flex">
          {chatContext && (
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-on-surface">
                  {chatContext.type === "order" ? "Pesanan Terkait" : "Produk Terkait"}
                </span>
              </div>
              <p className="text-[10px] font-bold text-primary">
                {chatContext.type === "order" ? `#${chatContext.orderNumber}` : "Produk Cetak"}
              </p>
              <p className="mt-1 text-xs font-bold leading-snug text-on-surface">
                {chatContext.productName}
              </p>
              {chatContext.materialName && (
                <p className="mt-1 text-[10px] text-on-surface-variant">{chatContext.materialName}</p>
              )}
              <Link
                href={chatContext.detailUrl}
                className="mt-3 block rounded-lg border border-outline-variant/50 px-3 py-2 text-center text-[10px] font-bold text-on-surface"
              >
                Lihat Detail
              </Link>
            </div>
          )}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-on-surface">Topik Cepat AI</span>
            </div>
            <div className="space-y-2">
              {["Rekomendasi Bahan", "Estimasi Pengerjaan", "Ukuran Produk", "Panduan File Cetak"].map((topic, index) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setInput(topic)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-[11px] font-bold",
                    ["bg-primary-container/60 text-on-primary-container", "bg-secondary-fixed/70 text-on-secondary-fixed", "bg-tertiary-container/60 text-on-tertiary-container", "bg-secondary-container/50 text-on-secondary-container"][index],
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4">
            <p className="text-[11px] font-bold text-on-surface">Layanan AI Faeyza</p>
            <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant">
              Membantu secara otomatis 24/7 untuk pertanyaan umum percetakan.
            </p>
          </div>
        </aside>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-inverse-surface/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-error">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-epilogue text-base font-bold text-on-surface">
              {deleteModal.mode === "all" ? "Hapus Semua Riwayat Chat?" : "Hapus Riwayat Chat?"}
            </h3>
            <p className="mt-2 text-xs text-on-surface-variant">Percakapan yang dihapus tidak dapat dipulihkan.</p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDeleteModal({ open: false, mode: "single" })} className="flex-1 rounded-lg border border-outline-variant/50 py-2.5 text-xs font-bold">Batal</button>
              <button type="button" onClick={confirmDelete} className="flex-1 rounded-lg bg-error py-2.5 text-xs font-bold text-on-error">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
