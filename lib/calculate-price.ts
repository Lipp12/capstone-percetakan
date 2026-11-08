// ---------------------------------------------------------------------------
// Kalkulator harga murni (tanpa React / side effect) supaya mudah diuji.
//
// Rumus:
//   harga satuan = harga dasar × faktor bahan × faktor ukuran
//   subtotal     = harga satuan × kuantitas
//   total        = subtotal − diskon bertingkat
//
// Diskon: 100+ pcs → 5%, 500+ pcs → 10% (tier tertinggi yang berlaku).
// ---------------------------------------------------------------------------

export interface DiscountTier {
  minQuantity: number;
  rate: number;
}

export const DISCOUNT_TIERS: DiscountTier[] = [
  { minQuantity: 500, rate: 0.1 },
  { minQuantity: 100, rate: 0.05 },
];

export function getDiscountRate(quantity: number, tiers: DiscountTier[] = DISCOUNT_TIERS): number {
  const qty = Number(quantity) || 0;
  const tier = [...tiers]
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .find((item) => qty >= item.minQuantity);
  return tier?.rate ?? 0;
}

export interface CalculatePriceInput {
  basePrice?: number;
  quantity?: number;
  materialFactor?: number;
  sizeFactor?: number;
  tiers?: DiscountTier[];
}

export interface PriceBreakdownResult {
  basePrice: number;
  quantity: number;
  materialFactor: number;
  sizeFactor: number;
  unitPrice: number;
  subtotal: number;
  discountRate: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export function calculatePrice({
  basePrice = 0,
  quantity = 0,
  materialFactor = 1,
  sizeFactor = 1,
  tiers = DISCOUNT_TIERS,
}: CalculatePriceInput = {}): PriceBreakdownResult {
  const base = Math.max(0, Number(basePrice) || 0);
  const material = Math.max(0, Number(materialFactor) || 0);
  const size = Math.max(0, Number(sizeFactor) || 0);
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));

  const unitPrice = Math.round(base * material * size);
  const subtotal = unitPrice * qty;
  const discountRate = getDiscountRate(qty, tiers);
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal - discountAmount;

  return {
    basePrice: base,
    quantity: qty,
    materialFactor: material,
    sizeFactor: size,
    unitPrice,
    subtotal,
    discountRate,
    discountPercent: Math.round(discountRate * 100),
    discountAmount,
    total,
  };
}

export default calculatePrice;