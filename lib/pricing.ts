export interface FinishingItem {
  id: string;
  name: string;
  price: number;
  unit: string; // "m2" atau "pcs"
}

export interface PricingParams {
  basePrice: number;
  unit: string; // "m2" atau "pcs"
  materialAdditionalPrice?: number;
  width?: number; // dalam meter
  height?: number; // dalam meter
  quantity: number;
  finishings?: FinishingItem[];
}

export interface PricingBreakdown {
  unit: string;
  area: number; // 1 jika pcs, width * height jika m2
  baseProductPrice: number;
  materialAdditionalPrice: number;
  unitPrice: number;
  subtotal: number;
  finishingsTotal: number;
  finishingsBreakdown: Array<{
    name: string;
    price: number;
    unit: string;
    total: number;
  }>;
  total: number;
}

/**
 * Menghitung estimasi harga cetak sesuai rumus spesifikasi capstone
 */
export function calculatePricing({
  basePrice,
  unit,
  materialAdditionalPrice = 0,
  width = 1,
  height = 1,
  quantity,
  finishings = [],
}: PricingParams): PricingBreakdown {
  const qty = Math.max(1, quantity || 1);
  const isM2 = unit.toLowerCase() === "m2";
  const area = isM2 ? Math.max(0.1, (width || 1) * (height || 1)) : 1;

  // Harga per unit dasar + tambahan material
  const unitPrice = basePrice + materialAdditionalPrice;

  // Subtotal produk + material
  const subtotal = unitPrice * (isM2 ? area : 1) * qty;

  // Hitung finishing
  const finishingsBreakdown = finishings.map((fin) => {
    const isFinM2 = fin.unit.toLowerCase() === "m2";
    const finTotal = fin.price * (isFinM2 ? area : 1) * qty;
    return {
      name: fin.name,
      price: fin.price,
      unit: fin.unit,
      total: Math.round(finTotal),
    };
  });

  const finishingsTotal = finishingsBreakdown.reduce(
    (acc, curr) => acc + curr.total,
    0
  );

  const total = Math.round(subtotal + finishingsTotal);

  return {
    unit,
    area: isM2 ? Number(area.toFixed(2)) : 1,
    baseProductPrice: basePrice,
    materialAdditionalPrice,
    unitPrice,
    subtotal: Math.round(subtotal),
    finishingsTotal,
    finishingsBreakdown,
    total,
  };
}
