"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SidebarContextValue = {
  /** Sidebar dalam keadaan expanded (desktop >= xl). */
  isExpanded: boolean;
  /** Sidebar sedang di-hover saat collapsed (desktop >= xl). */
  isHovered: boolean;
  /** Drawer terbuka di layar kecil (< xl). */
  isMobileOpen: boolean;
  /** Sidebar yangEffective terlihat: expanded, hovered, atau mobile drawer. */
  isOpen: boolean;
  toggleSidebar: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  setIsHovered: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleSidebar = useCallback(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setIsExpanded((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  }, []);

  // Kunci scroll body selagi drawer mobile terbuka.
  useEffect(() => {
    if (!isMobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileOpen]);

  // Esc menutup drawer mobile.
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isExpanded,
      isHovered,
      isMobileOpen,
      isOpen: isExpanded || isHovered || isMobileOpen,
      toggleSidebar,
      openMobile,
      closeMobile,
      setIsHovered,
    }),
    [
      isExpanded,
      isHovered,
      isMobileOpen,
      toggleSidebar,
      openMobile,
      closeMobile,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar harus dipakai di dalam <SidebarProvider>.");
  }
  return context;
}