// scripts/test-production-gate.ts
// Verifikasi aturan bisnis produksi (lunas + desain ACC) di lib/order-rules.ts.
// Jalankan: npx tsx scripts/test-production-gate.ts
import {
  evaluateProductionGate,
  productionGateMessage,
  PRODUCTION_AREA_STATUSES,
} from "../lib/order-rules";

let pass = 0;
let fail = 0;

function check(label: string, actual: boolean, expected: boolean) {
  if (actual === expected) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label} (expected ${expected}, got ${actual})`);
  }
}

console.log("== evaluateProductionGate ==");

// 1. Sudah bayar, sedang cek desain -> belum ACC, belum boleh masuk produksi
{
  const g = evaluateProductionGate("DESIGN_CHECKING", [
    "PENDING_PAYMENT",
    "PAID",
    "DESIGN_CHECKING",
  ]);
  check("bayar + cek desain -> tidak masuk", g.canEnterProduction, false);
  check("  isPaymentPaid benar", g.isPaymentPaid, true);
  check("  isDesignApproved benar", g.isDesignApproved, false);
  console.log(`  msg: ${productionGateMessage(g)}`);
}

// 2. Belum bayar sama sekali -> tidak boleh masuk produksi
{
  const g = evaluateProductionGate("PENDING_PAYMENT", ["PENDING_PAYMENT"]);
  check("belum bayar -> tidak masuk", g.canEnterProduction, false);
  check("  isPaymentPaid benar", g.isPaymentPaid, false);
  console.log(`  msg: ${productionGateMessage(g)}`);
}

// 3. Lunas tapi belum ACC -> tidak boleh masuk produksi
{
  const g = evaluateProductionGate("PAID", ["PENDING_PAYMENT", "PAID"]);
  check("lunas tanpa ACC -> tidak masuk", g.canEnterProduction, false);
  check("  isPaymentPaid benar", g.isPaymentPaid, true);
  console.log(`  msg: ${productionGateMessage(g)}`);
}

// 4. Lunas + ACC -> BOLEH masuk produksi
{
  const g = evaluateProductionGate("DESIGN_APPROVED", [
    "PENDING_PAYMENT",
    "PAID",
    "DESIGN_CHECKING",
    "DESIGN_APPROVED",
  ]);
  check("lunas + ACC -> masuk", g.canEnterProduction, true);
  check("  pesan error null", productionGateMessage(g) === null, true);
}

// 5. Kedua syarat gagal -> pesan menyebut keduanya
{
  const g = evaluateProductionGate("PENDING_PAYMENT", ["PENDING_PAYMENT"]);
  const msg = productionGateMessage(g) || "";
  check("pesan menyebut lunas", msg.includes("belum lunas"), true);
  check("pesan menyebut desain", msg.includes("belum disetujui"), true);
}

// 6. Sudah produksi (IN_PRODUCTION) tetap lolos gate
{
  const g = evaluateProductionGate("IN_PRODUCTION", [
    "PAID",
    "DESIGN_APPROVED",
    "IN_PRODUCTION",
  ]);
  check("sudah IN_PRODUCTION -> tetap lolos", g.canEnterProduction, true);
}

// 7. REGRESI: status DESIGN_APPROVED yang dipaksakan tanpa riwayat PAID
//    TIDAK boleh dianggap lunas. Ini bug yang pernah ada.
{
  const g = evaluateProductionGate("DESIGN_APPROVED", ["DESIGN_APPROVED"]);
  check("ACC dipaksakan tanpa PAID -> TIDAK lunas", g.isPaymentPaid, false);
  check("ACC dipaksakan tanpa PAID -> tidak masuk", g.canEnterProduction, false);
  console.log(`  msg: ${productionGateMessage(g)}`);
}

// 8. Cakupan PRODUCTION_AREA_STATUSES
{
  check(
    "DESIGN_APPROVED ada di area produksi",
    PRODUCTION_AREA_STATUSES.includes("DESIGN_APPROVED" as never),
    true
  );
  check(
    "IN_PRODUCTION ada di area produksi",
    PRODUCTION_AREA_STATUSES.includes("IN_PRODUCTION" as never),
    true
  );
  check(
    "PAID TIDAK ada di area produksi",
    PRODUCTION_AREA_STATUSES.includes("PAID" as never),
    false
  );
  check(
    "DESIGN_REJECTED TIDAK ada di area produksi",
    PRODUCTION_AREA_STATUSES.includes("DESIGN_REJECTED" as never),
    false
  );
}

// 9. History kosong tidak crash
{
  const g = evaluateProductionGate("PAID", []);
  check("history kosong + status PAID -> lunas", g.isPaymentPaid, true);
  check("history kosong + status PAID -> belum ACC", g.isDesignApproved, false);
  check("history kosong + status PAID -> tidak masuk", g.canEnterProduction, false);
}

console.log(`\n=== ${pass} pass, ${fail} fail ===`);
if (fail > 0) process.exit(1);
