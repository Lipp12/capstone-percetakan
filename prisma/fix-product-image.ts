// Fix terarah: ganti imageUrl produk yang link-nya sudah mati (HTTP 404).
//
// Sengaja TIDAK memakai prisma/seed.ts karena seed.ts menjalankan deleteMany()
// pada seluruh tabel. Di database production ada user & order yang bukan
// berasal dari seed, sehingga re-seed akan menghapusnya secara permanen.
//
// Script ini hanya menyentuh baris Product yang imageUrl-nya persis cocok
// dengan URL yang sudah diverifikasi 404.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DEAD_URL =
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";

const NEW_URL =
  "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80";

async function main() {
  const before = await prisma.product.findMany({
    where: { imageUrl: DEAD_URL },
    select: { id: true, name: true, slug: true, imageUrl: true },
  });

  console.log(`Baris produk yang cocok dengan URL rusak: ${before.length}`);
  for (const p of before) {
    console.log(`- ${p.name} (${p.slug})`);
    console.log(`  ${p.imageUrl}`);
  }

  if (before.length === 0) {
    console.log("\nTidak ada yang perlu diperbaiki.");
    return;
  }

  const { count } = await prisma.product.updateMany({
    where: { imageUrl: DEAD_URL },
    data: { imageUrl: NEW_URL },
  });

  console.log(`\nDiperbarui: ${count} produk`);
  console.log(`URL baru: ${NEW_URL}`);

  const after = await prisma.product.findMany({
    where: { id: { in: before.map((p) => p.id) } },
    select: { name: true, slug: true, imageUrl: true },
  });
  console.log("\n=== Verifikasi ===");
  for (const p of after) {
    console.log(`- ${p.name} (${p.slug})`);
    console.log(`  ${p.imageUrl}`);
  }

  const stillDead = await prisma.product.count({
    where: { imageUrl: DEAD_URL },
  });
  console.log(`\nSisa produk dengan URL rusak: ${stillDead}`);
}

main()
  .catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });