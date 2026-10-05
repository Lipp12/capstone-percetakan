import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Faeyza Printing | Sistem Percetakan",
  description:
    "Layanan cetak banner, poster, kartu nama, brosur, dan stiker secara online dengan estimasi harga real-time dan tracking pesanan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-stone-50 text-slate-900 antialiased selection:bg-rose-700 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
