"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Printer, ShoppingBag, Clock, Sparkles, LogOut, LayoutDashboard, Menu, X, User } from "lucide-react";
import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (session?.user as any)?.role;
  const isAdminOrOperator = role === "ADMIN" || role === "OPERATOR";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authRequired: true },
    { href: "/katalog", label: "Katalog Produk", icon: ShoppingBag },
    { href: "/orders", label: "Pesanan Saya", icon: Clock, authRequired: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-rose-700 text-white flex items-center justify-center">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight leading-none block">
                Faeyza Printing
              </span>
              <span className="text-[11px] text-rose-700 font-medium tracking-wide">
                Percetakan
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authRequired && !session) return null;
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-rose-50 text-rose-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <NotificationBell />

                {isAdminOrOperator && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Panel Admin
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                    {session.user?.name?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <span className="font-semibold text-slate-800 block">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {role?.toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    title="Keluar"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-rose-700 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-rose-700 hover:bg-rose-800 text-white rounded-md transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {session && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            if (link.authRequired && !session) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${pathname.startsWith(link.href) ? "bg-rose-50 text-rose-800" : "text-slate-700 hover:bg-slate-100"}`}
              >
                <Icon className="w-5 h-5 text-slate-500" />
                {link.label}
              </Link>
            );
          })}

          {isAdminOrOperator && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-rose-800 bg-rose-50"
            >
              <LayoutDashboard className="w-5 h-5" />
              Panel Admin
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100">
            {session ? (
              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-800">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-xs text-rose-600 font-medium"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium border border-slate-200 rounded-md"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-rose-700 text-white rounded-md"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
