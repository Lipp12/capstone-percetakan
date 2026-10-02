"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import type { Role } from "@/lib/ai";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = (session?.user as any)?.role;
  const isAdminOrOperator = userRole === "ADMIN" || userRole === "OPERATOR";

  // Default role sesuai login
  const [role, setRole] = useState<Role>("customer");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    } else if (isAdminOrOperator) {
      setRole("admin");
    } else {
      setRole("customer");
    }
  }, [status, isAdminOrOperator, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleClose = () => {
    if (isAdminOrOperator) {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        {/* Toggle Mode: Hanya muncul jika Admin/Operator */}
        {isAdminOrOperator ? (
          <div className="inline-flex p-1 bg-gray-200/80 rounded-xl text-xs font-medium shadow-inner">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                role === "customer"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mode Pelanggan
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                role === "admin"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mode Admin Copilot
            </button>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-500">
            Asisten Percetakan Online
          </span>
        )}
      </div>

      <ChatBox
        role={role}
        onRoleChange={isAdminOrOperator ? setRole : undefined}
        onClose={handleClose}
      />
    </main>
  );
}
