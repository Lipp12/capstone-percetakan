"use client";

import { useState } from "react";
import ChatBox from "@/components/ChatBox";
import type { Role } from "@/lib/ai";

export default function ChatPage() {
  // State untuk berpindah antara mode customer dan admin
  const [role, setRole] = useState<Role>("customer");

  return (
    <main className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl mb-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
          Chat AI Percetakan
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Asisten pintar konsultasi cetak (Customer) & operasional cepat (Admin)
        </p>

        {/* Toggle Mode: Memudahkan pengujian respons kedua mode */}
        <div className="flex justify-center mt-3">
          <div className="inline-flex p-1 bg-gray-200/80 rounded-xl text-xs font-medium shadow-inner">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`px-4 py-1.5 rounded-lg transition ${
                role === "customer"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mode Customer (Pelanggan)
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`px-4 py-1.5 rounded-lg transition ${
                role === "admin"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mode Admin Copilot
            </button>
          </div>
        </div>
      </div>

      <ChatBox role={role} onRoleChange={setRole} />
    </main>
  );
}
