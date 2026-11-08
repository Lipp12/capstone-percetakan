import React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingSupport from "@/components/FloatingSupport";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <SiteHeader />
      <div className="flex-1 pt-28">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </div>
      <SiteFooter />
      <FloatingSupport />
    </div>
  );
}