"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";
import Sidebar from "@/components/Sidebar";
import AdminHeader from "@/components/AdminHeader";

/**
 * Shell admin: sidebar fixed + topbar, dengan konten yang bergeser mengikuti
 * lebar sidebar (expanded / collapsed / hover).
 */
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar();

  return (
    <div className="h-screen overflow-hidden bg-ink-50">
      <Sidebar />

      {/* Backdrop untuk drawer mobile */}
      <div
        onClick={closeMobile}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-[2px] transition-opacity duration-300 xl:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <div
        className={cn(
          "flex h-full flex-col transition-[padding] duration-300 ease-in-out",
          isOpen ? "xl:ps-sidebar" : "xl:ps-sidebar-collapsed",
        )}
      >
        <AdminHeader />
        <main className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}