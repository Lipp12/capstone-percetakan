import fs from "fs";
import path from "path";

export interface TransactionRecord {
  id: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  item: string;
  qty: number;
  total: number;
  notes?: string;
}

export function getTransactions(period?: string): TransactionRecord[] {
  const filePath = path.join(process.cwd(), "data", "transactions.json");
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const rawData = fs.readFileSync(filePath, "utf-8");
  const transactions = JSON.parse(rawData) as TransactionRecord[];

  if (period) {
    return transactions.filter((t) => t.date.startsWith(period));
  }

  return transactions;
}
