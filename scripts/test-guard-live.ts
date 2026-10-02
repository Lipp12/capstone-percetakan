// scripts/test-guard-live.ts
// Uji guard aturan bisnis produksi lewat HTTP, bypass client sepenuhnya.
// Jalankan: npx tsx scripts/test-guard-live.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const BASE = "http://localhost:3000";
const prisma = new PrismaClient();

let cookie = "";

function mergeCookies(res: Response) {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const parts = sc.map((c) => c.split(";")[0]).filter(Boolean);
  cookie = [cookie, ...parts].filter(Boolean).join("; ");
}

async function login(email: string, password: string) {
  const cr = await fetch(`${BASE}/api/auth/csrf`);
  mergeCookies(cr);
  const csrfToken = (await cr.json()).csrfToken;

  const r = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    }),
  });
  mergeCookies(r);
  return { status: r.status, hasSession: /session-token/.test(cookie) };
}

async function setStatus(orderId: string, status: string, notes: string) {
  const r = await fetch(`${BASE}/api/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ status, notes }),
  });
  const text = await r.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {}
  return { status: r.status, body: parsed };
}

let pass = 0;
let fail = 0;
function check(label: string, ok: boolean, extra = "") {
  if (ok) {
    pass++;
    console.log(`  PASS  ${label}${extra ? " — " + extra : ""}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${extra ? " — " + extra : ""}`);
  }
}

async function main() {
  console.log("== Login ==");
  const adminEmail = `guardtest_admin_${Date.now()}@test.com`;
  const adminPw = "guardtest123";
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: await bcrypt.hash(adminPw, 10),
      name: "Guard Test Admin",
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  const lg = await login(adminEmail, adminPw);
  check("login admin berhasil", lg.hasSession, `http ${lg.status}`);
  if (!lg.hasSession) throw new Error("Gagal login, test dihentikan");

  const custEmail = `guardtest_cust_${Date.now()}@test.com`;
  const cust = await prisma.user.create({
    data: {
      email: custEmail,
      password: await bcrypt.hash("guardtest123", 10),
      name: "Guard Test Customer",
      phone: "081234567891",
      role: "CUSTOMER",
    },
  });

  const product = await prisma.product.findFirst();
  if (!product) throw new Error("Tidak ada produk di database, jalankan seed dulu");

  // --- Skenario 1: belum bayar, belum ACC -> HARUS DITOLAK ---
  console.log("\n== Skenario 1: belum lunas + belum ACC ==");
  const o1 = await prisma.order.create({
    data: {
      orderNumber: `GT-${Date.now()}-1`,
      userId: cust.id,
      productId: product.id,
      quantity: 1,
      pickupMethod: "PICKUP",
      totalPrice: 10000,
      status: "PENDING_PAYMENT",
      statusHistory: {
        create: { status: "PENDING_PAYMENT", notes: "test", changedBy: "test" },
      },
    },
  });
  for (const target of ["DESIGN_APPROVED", "IN_PRODUCTION", "FINISHING", "READY", "COMPLETED"]) {
    const r = await setStatus(o1.id, target, "bypass attempt");
    check(
      `tolak ${target} (belum lunas)`,
      r.status === 409,
      `http ${r.status}: ${r.body?.error ?? "-"}`
    );
  }
  const stillO1 = await prisma.order.findUnique({ where: { id: o1.id } });
  check("status o1 tidak berubah", stillO1?.status === "PENDING_PAYMENT", stillO1?.status);

  // --- Skenario 2: lunas, belum ACC -> IN_PRODUCTION HARUS DITOLAK ---
  console.log("\n== Skenario 2: lunas, belum ACC ==");
  const o2 = await prisma.order.create({
    data: {
      orderNumber: `GT-${Date.now()}-2`,
      userId: cust.id,
      productId: product.id,
      quantity: 1,
      pickupMethod: "PICKUP",
      totalPrice: 10000,
      status: "PAID",
      statusHistory: {
        create: { status: "PAID", notes: "lunas", changedBy: "test" },
      },
    },
  });
  const r2a = await setStatus(o2.id, "DESIGN_APPROVED", "approve desain");
  check("DESIGN_APPROVED boleh (aksi approve itu sendiri)", r2a.status === 200, `http ${r2a.status}`);

  // Reset ke PAID DAN hapus riwayat DESIGN_APPROVED, supaya tes benar-benar
  // menguji kondisi "lunas tapi belum ACC".
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: o2.id } });
  await prisma.order.update({
    where: { id: o2.id },
    data: {
      status: "PAID",
      statusHistory: { create: { status: "PAID", notes: "reset", changedBy: "test" } },
    },
  });
  const r2b = await setStatus(o2.id, "IN_PRODUCTION", "bypass attempt");
  check(
    "tolak IN_PRODUCTION (lunas tapi belum ACC)",
    r2b.status === 409,
    `http ${r2b.status}: ${r2b.body?.error ?? "-"}`
  );

  // --- Skenario 3: belum lunas, tapi "ACC" dipaksakan -> HARUS DITOLAK ---
  console.log("\n== Skenario 3: belum lunas, ACC dipaksakan ==");
  const o3 = await prisma.order.create({
    data: {
      orderNumber: `GT-${Date.now()}-3`,
      userId: cust.id,
      productId: product.id,
      quantity: 1,
      pickupMethod: "PICKUP",
      totalPrice: 10000,
      status: "DESIGN_APPROVED",
      statusHistory: {
        create: { status: "DESIGN_APPROVED", notes: "acc dipaksakan", changedBy: "test" },
      },
    },
  });
  const r3 = await setStatus(o3.id, "IN_PRODUCTION", "bypass attempt");
  check(
    "tolak IN_PRODUCTION (belum lunas walau status ACC)",
    r3.status === 409,
    `http ${r3.status}: ${r3.body?.error ?? "-"}`
  );
  const r3b = await setStatus(o3.id, "READY", "bypass attempt");
  check("tolak READY (belum lunas)", r3b.status === 409, `http ${r3b.status}`);

  // --- Skenario 4: lunas + ACC -> BOLEH masuk produksi ---
  console.log("\n== Skenario 4: lunas + ACC ==");
  const o4 = await prisma.order.create({
    data: {
      orderNumber: `GT-${Date.now()}-4`,
      userId: cust.id,
      productId: product.id,
      quantity: 1,
      pickupMethod: "PICKUP",
      totalPrice: 10000,
      status: "DESIGN_APPROVED",
      statusHistory: {
        create: [
          { status: "PAID", notes: "lunas", changedBy: "test" },
          { status: "DESIGN_APPROVED", notes: "acc", changedBy: "test" },
        ],
      },
    },
  });
  const r4 = await setStatus(o4.id, "IN_PRODUCTION", "mulai cetak");
  check("BOLEH IN_PRODUCTION (lunas + ACC)", r4.status === 200, `http ${r4.status}`);
  const r4b = await setStatus(o4.id, "FINISHING", "ke finishing");
  check("BOLEH FINISHING", r4b.status === 200, `http ${r4b.status}`);
  const r4c = await setStatus(o4.id, "READY", "siap");
  check("BOLEH READY", r4c.status === 200, `http ${r4c.status}`);

  // --- Skenario 5: role CUSTOMER tidak boleh ubah status ---
  console.log("\n== Skenario 5: otorisasi role ==");
  cookie = "";
  await login(custEmail, "guardtest123");
  const r5 = await setStatus(o4.id, "COMPLETED", "customer coba ubah status");
  check("CUSTOMER ditolak (403)", r5.status === 403, `http ${r5.status}`);

  // Bersihkan data test
  await prisma.orderStatusHistory.deleteMany({
    where: { orderId: { in: [o1.id, o2.id, o3.id, o4.id] } },
  });
  await prisma.order.deleteMany({
    where: { id: { in: [o1.id, o2.id, o3.id, o4.id] } },
  });
  await prisma.materialUsage.deleteMany({
    where: { orderId: { in: [o1.id, o2.id, o3.id, o4.id] } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [adminEmail, custEmail] } },
  });

  console.log(`\n=== ${pass} pass, ${fail} fail ===`);
  if (fail > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
