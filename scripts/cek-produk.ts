import { prisma } from "../lib/prisma";
import { KATALOG_CATEGORIES } from "../lib/service-categories";

const ALLOWED = new Set(KATALOG_CATEGORIES);

async function main() {
  const products = await prisma.product.findMany({
    include: { materials: { include: { material: true } } },
    orderBy: { name: "asc" },
  });

  console.log("=== Produk tanpa bahan ===");
  const noMat = products.filter((p) => p.materials.length === 0);
  if (noMat.length === 0) console.log("  (tidak ada)");
  else noMat.forEach((p) => console.log(`  - ${p.name} (${p.slug})`));

  console.log("\n=== Kategori di luar 7 stitch ===");
  const badCat = products.filter((p) => !ALLOWED.has(p.category));
  if (badCat.length === 0) console.log("  (tidak ada)");
  else badCat.forEach((p) => console.log(`  - ${p.name} (${p.slug}) -> "${p.category}"`));

  console.log("\n=== Nama/slug kembar ===");
  const nameMap = new Map<string, number>();
  const slugMap = new Map<string, number>();
  for (const p of products) {
    nameMap.set(p.name, (nameMap.get(p.name) ?? 0) + 1);
    slugMap.set(p.slug, (slugMap.get(p.slug) ?? 0) + 1);
  }
  const dupNames = [...nameMap.entries()].filter(([, c]) => c > 1);
  const dupSlugs = [...slugMap.entries()].filter(([, c]) => c > 1);
  if (dupNames.length === 0 && dupSlugs.length === 0) console.log("  (tidak ada)");
  if (dupNames.length) dupNames.forEach(([n, c]) => console.log(`  Nama duplikat: "${n}" (${c}x)`));
  if (dupSlugs.length) dupSlugs.forEach(([s, c]) => console.log(`  Slug duplikat: "${s}" (${c}x)`));

  console.log("\n=== Jumlah order per produk ===");
  const counts = await prisma.order.groupBy({ by: ["productId"], _count: { _all: true } });
  const byId = Object.fromEntries(counts.map((c) => [c.productId, c._count._all]));
  for (const p of products) {
    console.log(`  ${p.name} (${p.slug}) [${p.category}] -> ${byId[p.id] ?? 0} order`);
  }
  console.log("\nTotal produk:", products.length);
}

main().finally(() => prisma.$disconnect());