import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getTransactions } from "@/lib/transactions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7);

    const transactions = getTransactions(period);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistem Percetakan Online";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Laporan ${period}`);

    // Kolom tabel
    sheet.columns = [
      { header: "ID", key: "id", width: 12 },
      { header: "Tanggal", key: "date", width: 15 },
      { header: "Tipe", key: "type", width: 12 },
      { header: "Kategori", key: "category", width: 15 },
      { header: "Deskripsi / Item", key: "item", width: 40 },
      { header: "Qty", key: "qty", width: 8 },
      { header: "Total (Rp)", key: "total", width: 18 },
      { header: "Catatan", key: "notes", width: 25 },
    ];

    // Header styling
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" }, // Blue-600
    };

    // Tambah data
    transactions.forEach((tx) => {
      sheet.addRow({
        id: tx.id,
        date: tx.date,
        type: tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
        category: tx.category,
        item: tx.item,
        qty: tx.qty,
        total: tx.total,
        notes: tx.notes || "-",
      });
    });

    // Format mata uang di kolom total
    sheet.getColumn("total").numFmt = "#,##0";

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-transaksi-${period}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export Excel error:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor laporan transaksi" },
      { status: 500 }
    );
  }
}
