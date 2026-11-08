import { prisma } from "../lib/prisma";
import { SERVICE_CATEGORIES } from "../lib/service-categories";
async function main() {
  const dbCats = await prisma.product.findMany({ select: { category: true }, distinct: ["category"] });
  const allowed = SERVICE_CATEGORIES.map((s) => s.category).filter(Boolean) as string[];
  console.log("DB categories:");
  for (const c of dbCats) console.log(JSON.stringify(c.category), [...c.category].map(ch => ch.charCodeAt(0)));
  console.log("Allowed categories:");
  for (const c of allowed) console.log(JSON.stringify(c), [...c].map(ch => ch.charCodeAt(0)));
  console.log("Match check:");
  for (const c of dbCats) console.log(c.category, "->", allowed.includes(c.category));
}
main().finally(() => prisma.$disconnect());