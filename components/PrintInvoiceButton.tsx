"use client";

import { Printer } from "lucide-react";

export default function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 px-4 rounded-xl transition duration-150 shadow-md shadow-primary/20 active:translate-y-0.5"
      type="button"
    >
      <Printer className="w-5 h-5" />
      <span>Cetak Invoice</span>
    </button>
  );
}
