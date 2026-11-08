import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-12 text-center space-y-3">
      <p className="text-base font-semibold text-ink-700">Produk tidak ditemukan</p>
      <Link href="/katalog" className="text-xs font-semibold text-brand-600 hover:underline">
        Kembali ke Katalog
      </Link>
    </div>
  );
}