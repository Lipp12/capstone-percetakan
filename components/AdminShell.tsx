"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";
import Sidebar from "@/components/Sidebar";
import AdminHeader from "@/components/AdminHeader";

/**
 * Shell admin: sidebar fixed + topbar. Saat navigasi dipinjamkan, sidebar
 * hilang sepenuhnya dan konten memakai lebar penuh layar.
 */
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar();
  const pathname = usePathname();

  // Halaman chat memakai seluruh area konten, jadi padding <main> dilepas
  // supaya Kotak chat bisa menempel ke tepi shell.
  const isChatRoute = pathname.startsWith("/admin/chat");

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
          isOpen ? "xl:ps-sidebar" : "xl:ps-0",
        )}
      >
        <AdminHeader />
        <main
          className={cn(
            "custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden",
            isChatRoute
              ? ""
              : "px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}