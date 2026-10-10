import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data lama...");
  await prisma.transaction.deleteMany();
  await prisma.materialUsage.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderFinishing.deleteMany();
  await prisma.order.deleteMany();
  await prisma.finishing.deleteMany();
  await prisma.productMaterial.deleteMany();
  await prisma.product.deleteMany();
  await prisma.material.deleteMany();
  await prisma.user.deleteMany();

  console.log("Membuat Users...");
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const hashedPasswordOperator = await bcrypt.hash("operator123", 10);
  const hashedPasswordCustomer = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@percetakan.com",
      password: hashedPasswordAdmin,
      name: "Admin Percetakan",
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@percetakan.com",
      password: hashedPasswordOperator,
      name: "Budi Operator",
      phone: "081234567891",
      role: "OPERATOR",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "pelanggan@gmail.com",
      password: hashedPasswordCustomer,
      name: "Andi Pratama",
      phone: "081234567892",
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "siti@gmail.com",
      password: hashedPasswordCustomer,
      name: "Siti Rahma",
      phone: "081234567893",
      role: "CUSTOMER",
    },
  });

  console.log("Membuat Materials...");
  const matFlexiChina = await prisma.material.create({
    data: {
      name: "Flexi China 280gr",
      description: "Bahan spanduk standar outdoor, ekonomis",
      pricePerUnit: 15000,
      unit: "m2",
      stock: 120,
      minStock: 25,
    },
  });

  const matFlexiKorea = await prisma.material.create({
    data: {
      name: "Flexi Korea 440gr",
      description: "Bahan spanduk tebal, halus, tahan cuaca lama",
      pricePerUnit: 35000,
      unit: "m2",
      stock: 65,
      minStock: 20,
    },
  });

  const matVinylGlossy = await prisma.material.create({
    data: {
      name: "Vinyl Glossy",
      description: "Stiker vinyl kilap anti air dan cuaca",
      pricePerUnit: 40000,
      unit: "m2",
      stock: 45,
      minStock: 15,
    },
  });

  const matVinylDoff = await prisma.material.create({
    data: {
      name: "Vinyl Doff",
      description: "Stiker vinyl matte tidak memantulkan cahaya",
      pricePerUnit: 42000,
      unit: "m2",
      stock: 8, // Di bawah minStock -> Low Stock
      minStock: 15,
    },
  });

  const matArtPaper = await prisma.material.create({
    data: {
      name: "Art Paper 150gr",
      description: "Kertas licin mengkilap untuk flyer dan brosur",
      pricePerUnit: 1000,
      unit: "pcs",
      stock: 450,
      minStock: 100,
    },
  });

  const matArtCarton = await prisma.material.create({
    data: {
      name: "Art Carton 260gr",
      description: "Kertas tebal kaku untuk kartu nama dan poster",
      pricePerUnit: 1500,
      unit: "pcs",
      stock: 350,
      minStock: 100,
    },
  });

  const matHvs = await prisma.material.create({
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
  const finMataAyam = await prisma.finishing.create({
    data: {
      name: "Mata Ayam (Ring 4 Sudut)",
      price: 2500,
      unit: "pcs",
    },
  });

  const finLipat = await prisma.finishing.create({
    data: {
      name: "Lipat & Lem Keliling",
      price: 3000,
      unit: "m2",
    },
  });

  const finLaminasiGlossy = await prisma.finishing.create({
    data: {
      name: "Laminasi Panas Glossy",
      price: 8000,
      unit: "m2",
    },
  });

  const finLaminasiDoff = await prisma.finishing.create({
    data: {
      name: "Laminasi Panas Doff",
      price: 9000,
      unit: "m2",
    },
  });

  const finBoxMika = await prisma.finishing.create({
    data: {
      name: "Kotak Mika Kartu Nama",
      price: 4000,
      unit: "pcs",
    },
  });

  console.log("Membuat Products...");
  const prodBanner = await prisma.product.create({
    data: {
      name: "Banner Spanduk Outdoor",
      slug: "banner-spanduk-outdoor",
      description: "Cetak spanduk promosi outdoor tahan panas dan hujan dengan resolusi tajam.",
      category: "Outdoor",
      basePrice: 20000,
      unit: "m2",
      imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodRollUp = await prisma.product.create({
    data: {
      name: "Roll Up Banner Aluminium",
      slug: "roll-up-banner-aluminium",
      description: "Roll up banner portable 60x160cm atau 80x200cm termasuk rangka aluminium kokoh.",
      category: "Indoor",
      basePrice: 85000,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodPoster = await prisma.product.create({
    data: {
      name: "Poster Custom A3+",
      slug: "poster-custom-a3-plus",
      description: "Cetak poster ukuran A3+ (31x47cm) dengan warna cerah dan detail tajam.",
      category: "Indoor",
      basePrice: 12000,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodKartuNama = await prisma.product.create({
    data: {
      name: "Kartu Nama Bisnis (1 Box)",
      slug: "kartu-nama-bisnis",
      description: "Kartu nama isi 100 lembar per box dengan cetak 2 sisi full color dan presisi tinggi.",
      category: "Stationery",
      basePrice: 35000,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodStiker = await prisma.product.create({
    data: {
      name: "Stiker Vinyl Meteran + Kiss Cut",
      slug: "stiker-vinyl-meteran",
      description: "Stiker vinyl tahan air per meter persegi, sudah termasuk cutting sesuai pola.",
      category: "Merchandise",
      basePrice: 55000,
      unit: "m2",
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const prodFlyer = await prisma.product.create({
    data: {
      name: "Flyer & Brosur Promosi A5",
      slug: "flyer-brosur-promosi-a5",
      description: "Brosur ukuran A5 full color cetak 2 sisi, cocok untuk sebar promosi bisnis.",
      category: "Stationery",
      basePrice: 650,
      unit: "pcs",
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80",
    },
  });

  console.log("Menghubungkan Product & Material...");
  await prisma.productMaterial.createMany({
    data: [
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
    ],
  });

  console.log("Membuat Sample Orders...");
  // Order 1: Pending Payment
  const ord1 = await prisma.order.create({
    data: {
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
  const ord2 = await prisma.order.create({
    data: {
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
  const ord3 = await prisma.order.create({
    data: {
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
  const ord4 = await prisma.order.create({
    data: {
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
  const ord5 = await prisma.order.create({
    data: {
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
  const ord6 = await prisma.order.create({
    data: {
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
  const ord7 = await prisma.order.create({
    data: {
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
  const ord8 = await prisma.order.create({
    data: {
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
  await prisma.materialUsage.createMany({
    data: [
      { materialId: matFlexiKorea.id, orderId: ord5.id, quantity: 8.0, unit: "m2" },
      { materialId: matVinylGlossy.id, orderId: ord6.id, quantity: 4.0, unit: "m2" },
      { materialId: matArtPaper.id, orderId: ord7.id, quantity: 500, unit: "pcs" },
      { materialId: matFlexiChina.id, orderId: ord8.id, quantity: 2.0, unit: "m2" },
    ],
  });

  console.log("Membuat Data Transaksi Keuangan...");
  await prisma.transaction.createMany({
    data: [
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
    ],
  });

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
