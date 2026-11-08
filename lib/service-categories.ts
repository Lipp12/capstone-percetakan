// Sumber kebenaran pemetaan kartu "Layanan Cetak" di landing page
// ke kategori produk di katalog. Jangan menduplikasi daftar ini di tempat lain.

export interface ServiceCategory {
  slug: string;
  label: string;
  description: string;
  // Nilai kategori di data (Prisma). null = tidak ada padanan -> /katalog umum.
  category: string | null;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { slug: "banner-promosi", label: "Banner & Promosi", description: "X-Banner, Roll-up, Baliho & spanduk kain.", category: "Banner & Spanduk" },
  { slug: "poster-cetak-foto", label: "Poster & Cetak Foto", description: "Art print, kanvas premium, foto galeri resolusi HD.", category: "Poster & Cetak Foto" },
  { slug: "sticker-label", label: "Sticker & Label", description: "Die-cut, vinyl kromo, label kemasan anti-air.", category: "Stiker & Label" },
  { slug: "kartu-identitas", label: "Kartu & Identitas", description: "Kartu nama, ID card RFID, member card & lanyard.", category: "ID Card & Lanyard" },
  { slug: "brosur-leaflet", label: "Brosur & Leaflet", description: "Brosur lipat 2/3, flyer promosi, art paper doff.", category: "Brosur & Flyer" },
  { slug: "buku-dokumen", label: "Buku & Dokumen", description: "Buku jilid jahit, booklet, majalah, skripsi rapi.", category: "Cetak Dokumen" },
  { slug: "kemasan-packaging", label: "Kemasan & Packaging", description: "Box makanan, standing pouch, paper bag custom.", category: null },
  { slug: "stempel-flash", label: "Stempel Flash", description: "Stempel otomatis warna, stempel kayu, refill tinta.", category: null },
  { slug: "apparel-sablon", label: "Apparel & Sablon", description: "Kaos sablon DTF, tote bag, merchandise tekstil.", category: null },
];

export function categoryHref(cat: ServiceCategory): string {
  if (cat.category) {
    return `/katalog?category=${encodeURIComponent(cat.category)}`;
  }
  return "/katalog";
}