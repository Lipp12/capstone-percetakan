import React from "react";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "DESIGN_CHECKING"
  | "DESIGN_REJECTED"
  | "DESIGN_APPROVED"
  | "IN_PRODUCTION"
  | "FINISHING"
  | "READY"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

interface Props {
  status: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING_PAYMENT: {
    label: "Menunggu Bayar",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  PAID: {
    label: "Sudah Bayar",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  DESIGN_CHECKING: {
    label: "Cek Desain",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  DESIGN_REJECTED: {
    label: "Desain Ditolak",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  DESIGN_APPROVED: {
    label: "Desain ACC",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  IN_PRODUCTION: {
    label: "Proses Cetak",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  FINISHING: {
    label: "Finishing",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  READY: {
    label: "Siap Diambil",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  SHIPPING: {
    label: "Dikirim",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  COMPLETED: {
    label: "Selesai",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
  },
};

export default function OrderStatusBadge({ status, size = "md" }: Props) {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
  };

  const sizeClass = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3.5 py-1.5 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  );
}
