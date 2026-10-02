"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import {
  Clock,
  Printer,
  Scissors,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  X,
} from "lucide-react";

interface OrderCardItem {
  id: string;
  orderNumber: string;
  status: string;
  quantity: number;
  width?: number | null;
  height?: number | null;
  totalPrice: number;
  product: { name: string; unit: string };
  material?: { name: string } | null;
  user: { name: string };
  /** Desain sudah disetujui oleh admin (diverifikasi dari status + riwayat) */
  isDesignApproved?: boolean;
  /** Pembayaran sudah lunas (diverifikasi dari status + riwayat) */
  isPaymentPaid?: boolean;
}

interface Props {
  initialOrders: OrderCardItem[];
}

const COLUMNS = [
  {
    id: "DESIGN_APPROVED",
    title: "To Do (ACC)",
    desc: "Siap antre mesin",
    icon: Clock,
    color: "border-teal-500 bg-teal-50/50 text-teal-800",
  },
  {
    id: "IN_PRODUCTION",
    title: "Printing",
    desc: "Mesin mencetak",
    icon: Printer,
    color: "border-orange-500 bg-orange-50/50 text-orange-800",
  },
  {
    id: "FINISHING",
    title: "Finishing",
    desc: "Potong, lem, mata ayam",
    icon: Scissors,
    color: "border-purple-500 bg-purple-50/50 text-purple-800",
  },
  {
    id: "READY",
    title: "Done / Siap",
    desc: "Siap ambil / selesai",
    icon: CheckCircle2,
    color: "border-emerald-500 bg-emerald-50/50 text-emerald-800",
  },
];

function KanbanColumn({
  col,
  orders,
  onMoveQuick,
}: {
  col: (typeof COLUMNS)[0];
  orders: OrderCardItem[];
  onMoveQuick: (orderId: string, targetStatus: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  const Icon = col.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-100/80 rounded-3xl p-4 min-h-[500px] border transition ${
        isOver ? "border-blue-500 bg-blue-50/30" : "border-slate-200"
      }`}
    >
      {/* Header Kolom */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl border ${col.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 leading-tight">
              {col.title}
            </h3>
            <span className="text-[10px] text-slate-400">{col.desc}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-full border border-slate-200 shadow-xs">
          {orders.length}
        </span>
      </div>

      {/* Kartu Order */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
            Kosong
          </div>
        ) : (
          orders.map((ord) => (
            <KanbanCard key={ord.id} order={ord} onMoveQuick={onMoveQuick} />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  order,
  onMoveQuick,
}: {
  order: OrderCardItem;
  onMoveQuick: (orderId: string, targetStatus: string) => void;
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-xs text-slate-900">
          {order.orderNumber}
        </span>
        <Link
          href={`/admin/orders/${order.id}`}
          className="text-slate-400 hover:text-blue-600 transition"
          title="Buka detail order"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div>
        <p className="font-bold text-xs text-slate-800 line-clamp-1">
          {order.product.name}
        </p>
        <p className="text-[11px] text-slate-500">
          {order.material ? `${order.material.name} • ` : ""}
          {order.width && order.height ? `${order.width}x${order.height}m • ` : ""}
          Qty: {order.quantity}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <span className="text-slate-400 truncate max-w-[100px]">
          {order.user.name}
        </span>
        <span className="font-bold text-slate-800">
          {formatRupiah(order.totalPrice)}
        </span>
      </div>

      {/* Tombol Pindah Cepat */}
      <div className="flex items-center justify-between pt-1 gap-1">
        {order.status === "IN_PRODUCTION" && (
          <button
            type="button"
            onClick={() => onMoveQuick(order.id, "DESIGN_APPROVED")}
            className="p-1 text-[10px] text-slate-500 hover:text-slate-900 rounded bg-slate-100"
            title="Kembalikan ke To Do"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {order.status === "FINISHING" && (
          <button
            type="button"
            onClick={() => onMoveQuick(order.id, "IN_PRODUCTION")}
            className="p-1 text-[10px] text-slate-500 hover:text-slate-900 rounded bg-slate-100"
            title="Kembalikan ke Printing"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {order.status === "READY" && (
          <button
            type="button"
            onClick={() => onMoveQuick(order.id, "FINISHING")}
            className="p-1 text-[10px] text-slate-500 hover:text-slate-900 rounded bg-slate-100"
            title="Kembalikan ke Finishing"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex-1" />

        {order.status === "DESIGN_APPROVED" && (
          <button
            type="button"
            onClick={() => onMoveQuick(order.id, "IN_PRODUCTION")}
            className="px-2 py-1 text-[10px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center gap-1 ml-auto"
          >
            <span>Mulai Cetak</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        {order.status === "IN_PRODUCTION" && (
          <button
            type="button"
            onClick={() => onMoveQuick(order.id, "FINISHING")}
            className="px-2 py-1 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-1 ml-auto"
          >
            <span>Ke Finishing</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        {order.status === "FINISHING" && (
          <button
            type="button"
            onClick={() => onMoveQuick(order.id, "READY")}
            className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 ml-auto"
          >
            <span>Selesai (Siap)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ initialOrders }: Props) {
  const [orders, setOrders] = useState<OrderCardItem[]>(initialOrders);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setErrorMessage(null);
    const target = orders.find((o) => o.id === orderId);

    // Guard di client hanya untuk UX cepat. Guard yang authoritative ada di
    // server (app/api/orders/[id]/status/route.ts).
    if (newStatus === "DESIGN_APPROVED" && target) {
      if (target.isDesignApproved === false) {
        setErrorMessage(
          "Pesanan tidak bisa masuk To Do (ACC): desain belum disetujui. Validasi desain terlebih dahulu."
        );
        return;
      }
      if (target.isPaymentPaid === false) {
        setErrorMessage(
          "Pesanan tidak bisa masuk To Do (ACC): pembayaran belum lunas. Konfirmasi pembayaran terlebih dahulu."
        );
        return;
      }
    }

    // Optimistic update
    const previousStatus = target?.status;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: `Dipindahkan ke antrean ${newStatus} lewat Kanban Board`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        // Rollback: kembalikan status kartu ke nilai sebelumnya
        if (previousStatus) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
          );
        }

        setErrorMessage(
          data?.error || "Gagal memperbarui status pesanan. Silakan coba lagi."
        );
      }
    } catch (err) {
      console.error("Gagal update status Kanban:", err);
      if (previousStatus) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
        );
      }
      setErrorMessage("Koneksi bermasalah. Perubahan status tidak tersimpan.");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const orderId = active.id as string;
    const targetColumn = over.id as string;

    if (COLUMNS.some((col) => col.id === targetColumn)) {
      updateOrderStatus(orderId, targetColumn);
    }
  }

  const activeOrder = orders.find((o) => o.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {errorMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">Perubahan tidak dapat diterapkan</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 text-amber-600 hover:text-amber-900 rounded-lg hover:bg-amber-100 transition shrink-0"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => {
            if (col.id === "READY") {
              return o.status === "READY" || o.status === "COMPLETED";
            }
            if (col.id === "DESIGN_APPROVED") {
              // Kolom "To Do (ACC)" hanya untuk pesanan yang:
              // 1. desainnya sudah disetujui, dan
              // 2. pembayarannya sudah lunas.
              // Status DESIGN_APPROVED bisa berasal dari board sebelum aturan ini,
              // jadi tetap divalidasi lewat flag dari server.
              return (
                o.status === "DESIGN_APPROVED" &&
                o.isDesignApproved !== false &&
                o.isPaymentPaid !== false
              );
            }
            return o.status === col.id;
          });
          return (
            <KanbanColumn
              key={col.id}
              col={col}
              orders={colOrders}
              onMoveQuick={updateOrderStatus}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeOrder ? (
          <div className="opacity-80 rotate-2 scale-105 pointer-events-none">
            <KanbanCard order={activeOrder} onMoveQuick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
