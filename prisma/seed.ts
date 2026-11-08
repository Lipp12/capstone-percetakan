import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertMaterial(args: { data: any }) {
  const existing = await prisma.material.findFirst({ where: { name: args.data.name } });
  if (existing) return existing;
  return prisma.material.create(args);
}

async function upsertFinishing(args: { data: any }) {
  const existing = await prisma.finishing.findFirst({ where: { name: args.data.name } });
  if (existing) return existing;
  return prisma.finishing.create(args);
}

// Penggunaan:
//   npx prisma db seed                 -> data inti saja (user, material, finishing, produk)
//   SEED_DEMO=true npx prisma db seed  -> sertakan data contoh (order, usage, transaksi)
// Script ini idempotent: data inti di-upsert, data contoh hanya dibuat jika belum ada.
// Tidak menghapus data lama.

async function main() {
  const SEED_DEMO = process.env.SEED_DEMO === "true";
  console.log("Mode idempotent: tidak menghapus data lama. Membuat/memperbarui data (upsert)...");
  console.log(`Data contoh (order/usage/transaksi): ${SEED_DEMO ? "DIAKTIFKAN (SEED_DEMO=true)" : "DILEWATI (set SEED_DEMO=true untuk mengaktifkan)"}`);

  console.log("Membuat Users...");
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const hashedPasswordOperator = await bcrypt.hash("operator123", 10);
  const hashedPasswordCustomer = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@percetakan.com" },
    update: {},
    create: {
      email: "admin@percetakan.com",
      password: hashedPasswordAdmin,
      name: "Admin Percetakan",
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operator@percetakan.com" },
    update: {},
    create: {
      email: "operator@percetakan.com",
      password: hashedPasswordOperator,
      name: "Budi Operator",
      phone: "081234567891",
      role: "OPERATOR",
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "pelanggan@gmail.com" },
    update: {},
    create: {
      email: "pelanggan@gmail.com",
      password: hashedPasswordCustomer,
      name: "Andi Pratama",
      phone: "081234567892",
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "siti@gmail.com" },
    update: {},
    create: {
      email: "siti@gmail.com",
      password: hashedPasswordCustomer,
      name: "Siti Rahma",
      phone: "081234567893",
      role: "CUSTOMER",
    },
  });

  console.log("Membuat Materials...");
  const matFlexiChina = await upsertMaterial({
    data: {
      name: "Flexi China 280gr",
      description: "Bahan spanduk standar outdoor, ekonomis",
      pricePerUnit: 15000,
      unit: "m2",
      stock: 120,
      minStock: 25,
    },
  });

  const matFlexiKorea = await upsertMaterial({
    data: {
      name: "Flexi Korea 440gr",
      description: "Bahan spanduk tebal, halus, tahan cuaca lama",
      pricePerUnit: 35000,
      unit: "m2",
      stock: 65,
      minStock: 20,
    },
  });

  const matVinylGlossy = await upsertMaterial({
    data: {
      name: "Vinyl Glossy",
      description: "Stiker vinyl kilap anti air dan cuaca",
      pricePerUnit: 40000,
      unit: "m2",
      stock: 45,
      minStock: 15,
    },
  });

  const matVinylDoff = await upsertMaterial({
    data: {
      name: "Vinyl Doff",
      description: "Stiker vinyl matte tidak memantulkan cahaya",
      pricePerUnit: 42000,
      unit: "m2",
      stock: 8, // Di bawah minStock -> Low Stock
      minStock: 15,
    },
  });

  const matArtPaper = await upsertMaterial({
    data: {
      name: "Art Paper 150gr",
      description: "Kertas licin mengkilap untuk flyer dan brosur",
      pricePerUnit: 1000,
      unit: "pcs",
      stock: 450,
      minStock: 100,
    },
  });

  const matArtCarton = await upsertMaterial({
    data: {
      name: "Art Carton 260gr",
      description: "Kertas tebal kaku untuk kartu nama dan poster",
      pricePerUnit: 1500,
      unit: "pcs",
      stock: 350,
      minStock: 100,
    },
  });

  const matHvs = await upsertMaterial({
    data: {
      name: "HVS 80gr",
      description: "Kertas cetak dokumen standar",
      pricePerUnit: 300,
      unit: "pcs",
      stock: 5, // Di bawah minStock -> Low Stock
      minStock: 50,
    },
  });

  console.log("Membuat Finishings...");
  const finMataAyam = await upsertFinishing({
    data: {
      name: "Mata Ayam (Ring 4 Sudut)",
      price: 2500,
      unit: "pcs",
    },
  });

  const finLipat = await upsertFinishing({
    data: {
      name: "Lipat & Lem Keliling",
      price: 3000,
      unit: "m2",
    },
  });

  const finLaminasiGlossy = await upsertFinishing({
    data: {
      name: "Laminasi Panas Glossy",
      price: 8000,
      unit: "m2",
    },
  });

  const finLaminasiDoff = await upsertFinishing({
    data: {
      name: "Laminasi Panas Doff",
      price: 9000,
      unit: "m2",
    },
  });

  const finBoxMika = await upsertFinishing({
    data: {
      name: "Kotak Mika Kartu Nama",
      price: 4000,
      unit: "pcs",
    },
  });

  console.log("Membuat Products...");
  const prodBanner = await prisma.product.upsert({
    where: { slug: "banner-spanduk-outdoor" },
    update: { name: "Spanduk Flexi", category: "Banner & Spanduk" },
    create: {
      name: "Spanduk Flexi",
      slug: "banner-spanduk-outdoor",
      description: "Cetak spanduk promosi outdoor tahan panas dan hujan dengan resolusi tajam.",
      category: "Banner & Spanduk",
      basePrice: 20000,
      unit: "m2",
      imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodRollUp = await prisma.product.upsert({
    where: { slug: "roll-up-banner-aluminium" },
    update: { name: "Roll Up Banner", category: "Banner & Spanduk" },
    create: {
      name: "Roll Up Banner",
      slug: "roll-up-banner-aluminium",
      description: "Roll up banner portable 60x160cm atau 80x200cm termasuk rangka aluminium kokoh.",
      category: "Banner & Spanduk",
      basePrice: 85000,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodPoster = await prisma.product.upsert({
    where: { slug: "poster-custom-a3-plus" },
    update: { name: "Poster Dinding Art Carton", category: "Poster & Cetak Foto" },
    create: {
      name: "Poster Dinding Art Carton",
      slug: "poster-custom-a3-plus",
      description: "Cetak poster ukuran A3+ (31x47cm) dengan warna cerah dan detail tajam.",
      category: "Poster & Cetak Foto",
      basePrice: 12000,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodKartuNama = await prisma.product.upsert({
    where: { slug: "kartu-nama-bisnis" },
    update: { name: "ID Card PVC Standar", category: "ID Card & Lanyard" },
    create: {
      name: "ID Card PVC Standar",
      slug: "kartu-nama-bisnis",
      description: "Kartu nama isi 100 lembar per box dengan cetak 2 sisi full color dan presisi tinggi.",
      category: "ID Card & Lanyard",
      basePrice: 35000,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodStiker = await prisma.product.upsert({
    where: { slug: "stiker-vinyl-meteran" },
    update: { name: "Stiker Vinyl Matte / Glossy", category: "Stiker & Label" },
    create: {
      name: "Stiker Vinyl Matte / Glossy",
      slug: "stiker-vinyl-meteran",
      description: "Stiker vinyl tahan air per meter persegi, sudah termasuk cutting sesuai pola.",
      category: "Stiker & Label",
      basePrice: 55000,
      unit: "m2",
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodFlyer = await prisma.product.upsert({
    where: { slug: "flyer-brosur-promosi-a5" },
    update: { name: "Brosur", category: "Brosur & Flyer" },
    create: {
      name: "Brosur",
      slug: "flyer-brosur-promosi-a5",
      description: "Brosur ukuran A5 full color cetak 2 sisi, cocok untuk sebar promosi bisnis.",
      category: "Brosur & Flyer",
      basePrice: 650,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80",
    },
  });

  // Produk baru dari stitch (upsert berdasarkan slug)
  const prodFlyerRingkas = await prisma.product.upsert({
    where: { slug: "flyer-ringkas" },
    update: {},
    create: {
      name: "Flyer Ringkas",
      slug: "flyer-ringkas",
      description: "Flyer ringkas full color, cocok untuk promosi cepat.",
      category: "Stationery",
      basePrice: 120,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodBrosurLipat = await prisma.product.upsert({
    where: { slug: "brosur-lipat-bifold-trifold" },
    update: {},
    create: {
      name: "Brosur Lipat (Bi-Fold / Tri-Fold)",
      slug: "brosur-lipat-bifold-trifold",
      description: "Brosur lipat 2 atau 3 dengan finishing rapi.",
      category: "Stationery",
      basePrice: 970,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodUndangan = await prisma.product.upsert({
    where: { slug: "undangan-artisanal-boutique" },
    update: { name: "Undangan Softcover / Hardcover", category: "Undangan & Kartu Pos" },
    create: {
      name: "Undangan Softcover / Hardcover",
      slug: "undangan-artisanal-boutique",
      description: "Undangan premium dengan finishing artisanal.",
      category: "Undangan & Kartu Pos",
      basePrice: 3500,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    },
  });

  // Produk baru dari stitch (upsert berdasarkan slug)
  const prodXBanner = await prisma.product.upsert({ where: { slug: "x-banner-y-banner" }, update: {}, create: { name: "X-Banner & Y-Banner", slug: "x-banner-y-banner", description: "Display promosi fleksibel untuk koridor toko, seminar, dan bazaar.", category: "Banner & Spanduk", basePrice: 65000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodTripod = await prisma.product.upsert({ where: { slug: "tripod-banner" }, update: {}, create: { name: "Tripod Banner", slug: "tripod-banner", description: "Rangka tripod besi kokoh dengan tinggi fleksibel.", category: "Banner & Spanduk", basePrice: 145000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodBackdrop = await prisma.product.upsert({ where: { slug: "event-backdrop-photobooth" }, update: {}, create: { name: "Event Backdrop & Photobooth", slug: "event-backdrop-photobooth", description: "Banner ukuran besar sambung rapi tanpa batas untuk panggung seminar, wisuda, latar resepsi, pameran.", category: "Banner & Spanduk", basePrice: 35000, unit: "m2", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodMiniBanner = await prisma.product.upsert({ where: { slug: "mini-banner-meja" }, update: {}, create: { name: "Mini Banner Meja", slug: "mini-banner-meja", description: "Media promosi ringkas di atas meja resepsionis, kasir, atau etalase menu.", category: "Banner & Spanduk", basePrice: 30000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });

  const prodFlyerNew = await prisma.product.upsert({ where: { slug: "flyer" }, update: {}, create: { name: "Flyer", slug: "flyer", description: "Flyer promosi A5 full color.", category: "Brosur & Flyer", basePrice: 120, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80" } });
  const prodBrosurLipatNew = await prisma.product.upsert({ where: { slug: "brosur-lipat" }, update: {}, create: { name: "Brosur Lipat", slug: "brosur-lipat", description: "Brosur lipat 2 atau 3 dengan finishing rapi.", category: "Brosur & Flyer", basePrice: 970, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80" } });

  const prodPrintDokumen = await prisma.product.upsert({ where: { slug: "print-dokumen-a4-f4" }, update: {}, create: { name: "Print Dokumen A4 / F4", slug: "print-dokumen-a4-f4", description: "Cetak dokumen A4/F4 full color.", category: "Cetak Dokumen", basePrice: 500, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodJilidHardcover = await prisma.product.upsert({ where: { slug: "jilid-hardcover-skripsi" }, update: {}, create: { name: "Jilid Hardcover Skripsi", slug: "jilid-hardcover-skripsi", description: "Jilid hardcover untuk skripsi dan tugas akhir.", category: "Cetak Dokumen", basePrice: 35000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodJilidSpiral = await prisma.product.upsert({ where: { slug: "jilid-spiral-kawat" }, update: {}, create: { name: "Jilid Spiral Kawat", slug: "jilid-spiral-kawat", description: "Jilid spiral kawat dengan cover mika.", category: "Cetak Dokumen", basePrice: 12000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodJilidLem = await prisma.product.upsert({ where: { slug: "jilid-lem-panas-softcover" }, update: {}, create: { name: "Jilid Lem Panas (Softcover)", slug: "jilid-lem-panas-softcover", description: "Jilid lem panas softcover untuk buku dan novel.", category: "Cetak Dokumen", basePrice: 15000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodJilidJahit = await prisma.product.upsert({ where: { slug: "jilid-jahit-kawat-steples" }, update: {}, create: { name: "Jilid Jahit Kawat / Steples", slug: "jilid-jahit-kawat-steples", description: "Jilid jahit kawat/steples untuk booklet dan majalah.", category: "Cetak Dokumen", basePrice: 5000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });
  const prodPrintBesar = await prisma.product.upsert({ where: { slug: "print-format-besar-a2-a0" }, update: {}, create: { name: "Print Format Besar (A2 - A0)", slug: "print-format-besar-a2-a0", description: "Cetak format besar A2-A0 untuk plotting CAD dan blueprint.", category: "Cetak Dokumen", basePrice: 25000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" } });

  const prodStikerKromo = await prisma.product.upsert({ where: { slug: "stiker-kromo-chromo" }, update: {}, create: { name: "Stiker Kromo (Chromo)", slug: "stiker-kromo-chromo", description: "Stiker kertas cromo ekonomis untuk label packaging.", category: "Stiker & Label", basePrice: 9000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" } });
  const prodStikerTransparan = await prisma.product.upsert({ where: { slug: "stiker-transparan-bening" }, update: {}, create: { name: "Stiker Transparan Bening", slug: "stiker-transparan-bening", description: "Stiker transparan untuk efek no-label look.", category: "Stiker & Label", basePrice: 18000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" } });
  const prodStikerKraft = await prisma.product.upsert({ where: { slug: "stiker-kraft-cokelat" }, update: {}, create: { name: "Stiker Kraft Cokelat", slug: "stiker-kraft-cokelat", description: "Stiker kraft cokelat untuk produk artisan.", category: "Stiker & Label", basePrice: 14000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" } });
  const prodStikerHologram = await prisma.product.upsert({ where: { slug: "stiker-hologram-custom" }, update: {}, create: { name: "Stiker Hologram Custom", slug: "stiker-hologram-custom", description: "Stiker hologram custom untuk merchandise dan segel.", category: "Stiker & Label", basePrice: 25000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" } });
  const prodLabelRoll = await prisma.product.upsert({ where: { slug: "label-roll-thermal-barcode" }, update: {}, create: { name: "Label Roll Thermal / Barcode", slug: "label-roll-thermal-barcode", description: "Label roll thermal/barcode untuk kasir dan logistik.", category: "Stiker & Label", basePrice: 35000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" } });
  const prodStikerFoil = await prisma.product.upsert({ where: { slug: "stiker-gold-silver-foil-emboss" }, update: {}, create: { name: "Stiker Gold & Silver Foil / Emboss", slug: "stiker-gold-silver-foil-emboss", description: "Stiker foil emas/perak dengan efek emboss untuk kemasan premium.", category: "Stiker & Label", basePrice: 30000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" } });

  const prodKartuPos = await prisma.product.upsert({ where: { slug: "kartu-pos-seni-postcard-a6" }, update: {}, create: { name: "Kartu Pos Seni (Postcard A6)", slug: "kartu-pos-seni-postcard-a6", description: "Cetak kartu pos merchandise ilustrasi atau photocard dua sisi.", category: "Undangan & Kartu Pos", basePrice: 2000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80" } });
  const prodKartuUcapan = await prisma.product.upsert({ where: { slug: "kartu-ucapan-greeting-card" }, update: {}, create: { name: "Kartu Ucapan & Greeting Card", slug: "kartu-ucapan-greeting-card", description: "Kartu ucapan hari raya, terima kasih, dan event kantor.", category: "Undangan & Kartu Pos", basePrice: 2500, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80" } });

  const prodTaliLanyard = await prisma.product.upsert({ where: { slug: "tali-lanyard-sublimasi" }, update: {}, create: { name: "Tali Lanyard Sublimasi", slug: "tali-lanyard-sublimasi", description: "Cetak pita lanyard tisu lembut dua sisi full color.", category: "ID Card & Lanyard", basePrice: 8000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80" } });
  const prodPaketBundling = await prisma.product.upsert({ where: { slug: "paket-bundling-id-card-lanyard" }, update: {}, create: { name: "Paket Bundling ID Card + Lanyard", slug: "paket-bundling-id-card-lanyard", description: "Paket komplit kartu PVC, tali lanyard custom, dan card holder.", category: "ID Card & Lanyard", basePrice: 11500, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80" } });

  const prodCetakFoto = await prisma.product.upsert({ where: { slug: "cetak-foto-luster-silky" }, update: {}, create: { name: "Cetak Foto Luster & Silky", slug: "cetak-foto-luster-silky", description: "Cetak foto luster dan silky.", category: "Poster & Cetak Foto", basePrice: 15000, unit: "pcs", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80" } });
  const prodPosterAlbatros = await prisma.product.upsert({ where: { slug: "poster-albatros-matte" }, update: {}, create: { name: "Poster Albatros / Matte", slug: "poster-albatros-matte", description: "Poster albatros/matte.", category: "Poster & Cetak Foto", basePrice: 35000, unit: "m2", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80" } });

  console.log("Menghubungkan Product & Material...");
  const productMaterialLinks = [
    { productId: prodBanner.id, materialId: matFlexiChina.id, additionalPrice: 0 },
    { productId: prodBanner.id, materialId: matFlexiKorea.id, additionalPrice: 15000 },
    { productId: prodRollUp.id, materialId: matFlexiKorea.id, additionalPrice: 0 },
    { productId: prodRollUp.id, materialId: matVinylGlossy.id, additionalPrice: 10000 },
    { productId: prodPoster.id, materialId: matArtPaper.id, additionalPrice: 0 },
    { productId: prodPoster.id, materialId: matArtCarton.id, additionalPrice: 2000 },
    { productId: prodKartuNama.id, materialId: matArtCarton.id, additionalPrice: 0 },
    { productId: prodStiker.id, materialId: matVinylGlossy.id, additionalPrice: 0 },
    { productId: prodStiker.id, materialId: matVinylDoff.id, additionalPrice: 5000 },
    { productId: prodFlyer.id, materialId: matArtPaper.id, additionalPrice: 0 },
    { productId: prodFlyer.id, materialId: matArtCarton.id, additionalPrice: 300 },
    { productId: prodFlyerRingkas.id, materialId: matArtPaper.id, additionalPrice: 0 },
    { productId: prodBrosurLipat.id, materialId: matArtPaper.id, additionalPrice: 0 },
    { productId: prodBrosurLipat.id, materialId: matArtCarton.id, additionalPrice: 300 },
    { productId: prodUndangan.id, materialId: matArtCarton.id, additionalPrice: 0 },
  ];
  for (const link of productMaterialLinks) {
    const exists = await prisma.productMaterial.findFirst({
      where: { productId: link.productId, materialId: link.materialId },
    });
    if (!exists) {
      await prisma.productMaterial.create({ data: link });
    }
  }

  if (SEED_DEMO) {
  console.log("Membuat Sample Orders...");
  // Order 1: Pending Payment
  const ord1 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260920-001" },
    update: {},
    create: {
      orderNumber: "ORD-20260920-001",
      userId: customer1.id,
      productId: prodBanner.id,
      materialId: matFlexiChina.id,
      width: 3,
      height: 1,
      quantity: 2,
      pickupMethod: "PICKUP",
      totalPrice: 125000,
      status: "PENDING_PAYMENT",
      statusHistory: {
        create: {
          status: "PENDING_PAYMENT",
          notes: "Pesanan dibuat oleh pelanggan",
          changedBy: customer1.name,
        },
      },
      finishings: {
        create: [{ finishingId: finMataAyam.id, price: 5000 }],
      },
    },
  });

  // Order 2: Paid
  const ord2 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260921-002" },
    update: {},
    create: {
      orderNumber: "ORD-20260921-002",
      userId: customer1.id,
      productId: prodPoster.id,
      materialId: matArtCarton.id,
      quantity: 20,
      pickupMethod: "DELIVERY",
      address: "Jl. Dipati Ukur No. 45, Coblong, Kota Bandung",
      totalPrice: 280000,
      status: "PAID",
      paymentMethod: "QRIS",
      paymentProofUrl: "/uploads/payments/sample-qris.jpg",
      statusHistory: {
        createMany: {
          data: [
            { status: "PENDING_PAYMENT", notes: "Pesanan dibuat", changedBy: customer1.name },
            { status: "PAID", notes: "Pembayaran QRIS telah diverifikasi", changedBy: "System" },
          ],
        },
      },
    },
  });

  // Order 3: Design Checking
  const ord3 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260922-003" },
    update: {},
    create: {
      orderNumber: "ORD-20260922-003",
      userId: customer2.id,
      productId: prodRollUp.id,
      materialId: matFlexiKorea.id,
      quantity: 2,
      pickupMethod: "PICKUP",
      totalPrice: 170000,
      status: "DESIGN_CHECKING",
      designFileUrl: "/uploads/designs/sample-rollup.pdf",
      designNotes: "Mohon pastikan warna background cyan tidak pecah ya kak.",
      paymentMethod: "BCA_TRANSFER",
      statusHistory: {
        createMany: {
          data: [
            { status: "PENDING_PAYMENT", notes: "Pesanan dibuat", changedBy: customer2.name },
            { status: "PAID", notes: "Pembayaran terverifikasi", changedBy: admin.name },
            { status: "DESIGN_CHECKING", notes: "File desain diupload pelanggan", changedBy: customer2.name },
          ],
        },
      },
    },
  });

  // Order 4: Design Approved -> To Do di Kanban
  const ord4 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260922-004" },
    update: {},
    create: {
      orderNumber: "ORD-20260922-004",
      userId: customer2.id,
      productId: prodKartuNama.id,
      materialId: matArtCarton.id,
      quantity: 4,
      pickupMethod: "DELIVERY",
      address: "Jl. Dago Asri No. 12, Bandung",
      totalPrice: 156000,
      status: "DESIGN_APPROVED",
      designFileUrl: "/uploads/designs/sample-kartu.pdf",
      designNotes: "Desain resolusi 300 DPI, siap cetak.",
      paymentMethod: "BCA_TRANSFER",
      finishings: {
        create: [{ finishingId: finBoxMika.id, price: 16000 }],
      },
      statusHistory: {
        createMany: {
          data: [
            { status: "PENDING_PAYMENT", notes: "Pesanan dibuat", changedBy: customer2.name },
            { status: "PAID", notes: "Pembayaran diverifikasi", changedBy: admin.name },
            { status: "DESIGN_CHECKING", notes: "Pengecekan desain", changedBy: "System" },
            { status: "DESIGN_APPROVED", notes: "File ACC, antre cetak", changedBy: admin.name },
          ],
        },
      },
    },
  });

  // Order 5: In Production (Printing di Kanban)
  const ord5 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260923-005" },
    update: {},
    create: {
      orderNumber: "ORD-20260923-005",
      userId: customer1.id,
      productId: prodBanner.id,
      materialId: matFlexiKorea.id,
      width: 4,
      height: 2,
      quantity: 1,
      pickupMethod: "PICKUP",
      totalPrice: 289000,
      status: "IN_PRODUCTION",
      designFileUrl: "/uploads/designs/sample-banner.pdf",
      paymentMethod: "MANDIRI_TRANSFER",
      finishings: {
        create: [
          { finishingId: finLipat.id, price: 24000 },
          { finishingId: finMataAyam.id, price: 10000 },
        ],
      },
      statusHistory: {
        createMany: {
          data: [
            { status: "PENDING_PAYMENT", notes: "Pesanan dibuat", changedBy: customer1.name },
            { status: "PAID", notes: "Lunas", changedBy: admin.name },
            { status: "DESIGN_APPROVED", notes: "ACC Desain", changedBy: admin.name },
            { status: "IN_PRODUCTION", notes: "Mesin Roland printing dimulai", changedBy: operator.name },
          ],
        },
      },
    },
  });

  // Order 6: Finishing di Kanban
  const ord6 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260923-006" },
    update: {},
    create: {
      orderNumber: "ORD-20260923-006",
      userId: customer2.id,
      productId: prodStiker.id,
      materialId: matVinylGlossy.id,
      width: 2,
      height: 1,
      quantity: 2,
      pickupMethod: "DELIVERY",
      address: "Jl. Sukajadi No. 88, Bandung",
      totalPrice: 240000,
      status: "FINISHING",
      designFileUrl: "/uploads/designs/sample-stiker.pdf",
      paymentMethod: "QRIS",
      statusHistory: {
        createMany: {
          data: [
            { status: "PAID", notes: "Lunas", changedBy: admin.name },
            { status: "IN_PRODUCTION", notes: "Proses print selesai", changedBy: operator.name },
            { status: "FINISHING", notes: "Proses potong die-cut", changedBy: operator.name },
          ],
        },
      },
    },
  });

  // Order 7: Ready for Pickup
  const ord7 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260924-007" },
    update: {},
    create: {
      orderNumber: "ORD-20260924-007",
      userId: customer1.id,
      productId: prodFlyer.id,
      materialId: matArtPaper.id,
      quantity: 500,
      pickupMethod: "PICKUP",
      totalPrice: 325000,
      status: "READY",
      paymentMethod: "BCA_TRANSFER",
      statusHistory: {
        createMany: {
          data: [
            { status: "PAID", notes: "Lunas", changedBy: admin.name },
            { status: "IN_PRODUCTION", notes: "Cetak selesai", changedBy: operator.name },
            { status: "FINISHING", notes: "Potong rapi selesai", changedBy: operator.name },
            { status: "READY", notes: "Pesanan siap diambil di meja kasir", changedBy: admin.name },
          ],
        },
      },
    },
  });

  // Order 8: Completed
  const ord8 = await prisma.order.upsert({
    where: { orderNumber: "ORD-20260918-008" },
    update: {},
    create: {
      orderNumber: "ORD-20260918-008",
      userId: customer1.id,
      productId: prodBanner.id,
      materialId: matFlexiChina.id,
      width: 2,
      height: 1,
      quantity: 1,
      pickupMethod: "PICKUP",
      totalPrice: 42500,
      status: "COMPLETED",
      paymentMethod: "CASH",
      statusHistory: {
        createMany: {
          data: [
            { status: "PAID", notes: "Bayar di toko", changedBy: admin.name },
            { status: "COMPLETED", notes: "Pesanan telah diambil pelanggan", changedBy: admin.name },
          ],
        },
      },
    },
  });

  console.log("Membuat Material Usage untuk Order yang sedang / selesai produksi...");
  const materialUsages = [
    { materialId: matFlexiKorea.id, orderId: ord5.id, quantity: 8.0, unit: "m2" },
    { materialId: matVinylGlossy.id, orderId: ord6.id, quantity: 4.0, unit: "m2" },
    { materialId: matArtPaper.id, orderId: ord7.id, quantity: 500, unit: "pcs" },
    { materialId: matFlexiChina.id, orderId: ord8.id, quantity: 2.0, unit: "m2" },
  ];
  for (const usage of materialUsages) {
    const exists = await prisma.materialUsage.findFirst({
      where: { orderId: usage.orderId, materialId: usage.materialId },
    });
    if (!exists) {
      await prisma.materialUsage.create({ data: usage });
    }
  }

  console.log("Membuat Data Transaksi Keuangan...");
  const transactions = [
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260918-008 (Banner)",
        qty: 1,
        total: 42500,
        orderId: ord8.id,
        date: new Date("2026-09-18T10:00:00Z"),
        notes: "Cash di kasir",
      },
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260921-002 (Poster)",
        qty: 1,
        total: 280000,
        orderId: ord2.id,
        date: new Date("2026-09-21T14:30:00Z"),
        notes: "QRIS",
      },
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260922-003 (Roll Up)",
        qty: 1,
        total: 170000,
        orderId: ord3.id,
        date: new Date("2026-09-22T09:15:00Z"),
        notes: "Transfer BCA",
      },
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260922-004 (Kartu Nama)",
        qty: 1,
        total: 156000,
        orderId: ord4.id,
        date: new Date("2026-09-22T16:00:00Z"),
        notes: "Transfer BCA",
      },
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260923-005 (Banner Korea)",
        qty: 1,
        total: 289000,
        orderId: ord5.id,
        date: new Date("2026-09-23T11:20:00Z"),
        notes: "Transfer Mandiri",
      },
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260923-006 (Stiker Vinyl)",
        qty: 1,
        total: 240000,
        orderId: ord6.id,
        date: new Date("2026-09-23T15:45:00Z"),
        notes: "QRIS",
      },
      {
        type: "INCOME",
        category: "Order",
        item: "Pembayaran ORD-20260924-007 (Flyer A5)",
        qty: 1,
        total: 325000,
        orderId: ord7.id,
        date: new Date("2026-09-24T08:30:00Z"),
        notes: "Transfer BCA",
      },
      {
        type: "EXPENSE",
        category: "Material",
        item: "Restock Roll Flexi China 280gr (3 roll)",
        qty: 3,
        total: 900000,
        date: new Date("2026-09-15T09:00:00Z"),
        notes: "Supplier PT Grafika Mandiri",
      },
      {
        type: "EXPENSE",
        category: "Material",
        item: "Tinta Eco Solvent CMYK (4 botol)",
        qty: 4,
        total: 650000,
        date: new Date("2026-09-17T11:00:00Z"),
        notes: "Refill mesin outdoor",
      },
      {
        type: "EXPENSE",
        category: "Operasional",
        item: "Listrik & Internet Workshop September",
        qty: 1,
        total: 450000,
        date: new Date("2026-09-20T10:00:00Z"),
        notes: "PLN & Indihome",
      },
    ];
  for (const tx of transactions) {
    const exists = await prisma.transaction.findFirst({ where: { item: tx.item } });
    if (!exists) {
      await prisma.transaction.create({ data: tx });
    }
  }

  }
  console.log("Seeding database berhasil selesai!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
