// components/SiteFooter.tsx
import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container-high/60 mt-auto pt-10 pb-6">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-3">
          <Image
            src="/logo.png"
            alt="Faeyza Digital Printing"
            width={160}
            height={40}
            className="h-9 w-auto object-contain"
          />
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md leading-relaxed">
            Workshop Digital &amp; Offset Printing terpercaya di Yogyakarta. Melayani percetakan
            brosur, banner, stiker, buku, dan kebutuhan promosi berkualitas galeri dengan kalibrasi
            warna terstandar.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">
            Pusat Bantuan
          </h4>
          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
            <li><Link href="/help/prepress" className="hover:text-primary transition-colors">Panduan Siap Cetak (Prepress)</Link></li>
            <li><Link href="/help/cmyk" className="hover:text-primary transition-colors">Standar Warna &amp; Profil CMYK</Link></li>
            <li><Link href="/help/shipping" className="hover:text-primary transition-colors">Ongkos Kirim &amp; Ekspedisi</Link></li>
            <li><Link href="/help/garansi" className="hover:text-primary transition-colors">Kebijakan Garansi &amp; Retur</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">
            Bantuan Langsung
          </h4>
          <div className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
              Senin - Sabtu: 08:00 - 21:00 WIB
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">chat</span>
              WhatsApp: +62 812-3456-7890
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
              order@faeyzaprinting.co.id
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 border-t border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
        <span>© 2025 Faeyza Digital Printing. Seluruh hak cipta dilindungi.</span>
        <div className="flex items-center gap-4 font-label-md text-label-md">
          <Link href="/terms" className="hover:text-on-surface transition-colors">Syarat &amp; Ketentuan</Link>
          <Link href="/privacy" className="hover:text-on-surface transition-colors">Privasi</Link>
          <Link href="/studio" className="hover:text-on-surface transition-colors">Studio Atelier</Link>
        </div>
      </div>
    </footer>
  );
}