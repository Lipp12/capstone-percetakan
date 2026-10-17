import React from "react";
import { SidebarProvider } from "@/components/SidebarContext";
import AdminShell from "@/components/AdminShell";

export const metadata = {
  title: "Panel Admin & Produksi - Percetakan Online",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}