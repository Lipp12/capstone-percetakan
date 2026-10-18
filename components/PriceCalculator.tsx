"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, MessageCircle, Ruler } from "lucide-react";
import { calculatePricing } from "@/lib/pricing";
import { formatRupiah } from "@/lib/utils";

export type CalculatorMaterial = {
  name: string;
  additionalPrice: number;
};

export type CalculatorProduct = {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  materials: CalculatorMaterial[];
};

export type CalculatorFinishing = {
  id: string;
  name: string;
  price: number;
  unit: string;
};

type Props = {
  products: CalculatorProduct[];
  finishings: CalculatorFinishing[];
};

/**
 * Nomor WhatsApp tujuan. Set lewat .env (lihat .env.example):
 * NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx
 * Nilai di bawah hanya fallback supaya tautan tetap valid saat env belum diisi.
 */
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "6281234567890";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/30";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700";

export default function PriceCalculator({ products, finishings }: Props) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [materialName, setMaterialName] = useState(
    products[0]?.materials[0]?.name ?? "",
  );
  const [width, setWidth] = useState("1");
  const [height, setHeight] = useState("1");
  const [quantity, setQuantity] = useState("1");
  const [selectedFinishings, setSelectedFinishings] = useState<string[]>([]);

  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? products[0],
    [products, productId],
  );

  const material =
    product?.materials.find((item) => item.name === materialName) ??
    product?.materials[0];

  const isM2 = (product?.unit ?? "pcs").toLowerCase() === "m2";

  const breakdown = useMemo(() => {
    if (!product) return null;
    return calculatePricing({
      basePrice: product.basePrice,
      unit: product.unit,
      materialAdditionalPrice: material?.additionalPrice ?? 0,
      width: Number(width) || 1,
      height: Number(height) || 1,
      quantity: Number(quantity) || 1,
      finishings: finishings.filter((item) =>
        selectedFinishings.includes(item.id),
      ),
    });
  }, [product, material, width, height, quantity, finishings, selectedFinishings]);

  function handleProductChange(id: string) {
    const next = products.find((item) => item.id === id);
    setProductId(id);
    setMaterialName(next?.materials[0]?.name ?? "");
    setSelectedFinishings([]);
  }

  function toggleFinishing(id: string) {
    setSelectedFinishings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function buildWaLink() {
    const lines = [
      `Halo Faeyza Printing, saya mau tanya harga cetak.`,
      `Produk: ${product?.name ?? "-"}`,
      `Bahan: ${material?.name ?? "-"}`,
      isM2 ? `Ukuran: ${width || 1} m x ${height || 1} m` : null,
      `Jumlah: ${quantity || 1} ${product?.unit ?? "pcs"}`,
      selectedFinishings.length > 0
        ? `Finishing: ${selectedFinishings
            .map((id) => finishings.find((item) => item.id === id)?.name)
            .filter(Boolean)
            .join(", ")}`
        : null,
      `Estimasi dari kalkulator: ${breakdown ? formatRupiah(breakdown.total) : "-"}`,
    ].filter(Boolean);

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      lines.join("\n"),
    )}`;
  }

  if (!product || !breakdown) return null;

  return (
    <section className="w-full border-b border-stone-200 bg-[#f2ecdf] px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm font-medium text-rose-700">
            Perkiraan sebelum memesan
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
            Hitung biaya cetak
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Pilih jenis produk, ukuran, bahan, dan finishing. Estimasi langsung
            dihitung sesuai harga bahan yang sedang dipakai.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          {/* Form */}
          <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
            <div>
              <label htmlFor="calc-product" className={labelClass}>
                Jenis produk
              </label>
              <select
                id="calc-product"
                value={product.id}
                onChange={(event) => handleProductChange(event.target.value)}
                className={inputClass}
              >
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — mulai {formatRupiah(item.basePrice)}/{item.unit}
                  </option>
                ))}
              </select>
            </div>

            {isM2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="calc-width" className={labelClass}>
                    Panjang (meter)
                  </label>
                  <input
                    id="calc-width"
                    type="number"
                    inputMode="decimal"
                    min={0.1}
                    step={0.1}
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="calc-height" className={labelClass}>
                    Lebar (meter)
                  </label>
                  <input
                    id="calc-height"
                    type="number"
                    inputMode="decimal"
                    min={0.1}
                    step={0.1}
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Ruler className="h-3.5 w-3.5 text-slate-400" />
                Produk ini dihitung per {product.unit}, jadi ukuran tidak
                diperlukan.
              </p>
            )}

            {product.materials.length > 0 ? (
              <div>
                <label htmlFor="calc-material" className={labelClass}>
                  Bahan baku
                </label>
                <select
                  id="calc-material"
                  value={material?.name ?? ""}
                  onChange={(event) => setMaterialName(event.target.value)}
                  className={inputClass}
                >
                  {product.materials.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                      {item.additionalPrice > 0
                        ? ` (+${formatRupiah(item.additionalPrice)})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {finishings.length > 0 ? (
              <fieldset>
                <legend className={labelClass}>Opsi finishing</legend>
                <div className="flex flex-wrap gap-2">
                  {finishings.map((item) => {
                    const active = selectedFinishings.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`cursor-pointer select-none rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "border-rose-600 bg-rose-50 text-rose-700"
                            : "border-stone-300 bg-white text-slate-600 hover:border-stone-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={active}
                          onChange={() => toggleFinishing(item.id)}
                        />
                        {item.name}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            <div>
              <label htmlFor="calc-quantity" className={labelClass}>
                Kuantitas ({product.unit})
              </label>
              <input
                id="calc-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Ringkasan biaya */}
          <div className="flex flex-col rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <span className="rounded-md bg-rose-50 p-1.5 text-rose-700">
                <Calculator className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Ringkasan biaya
              </span>
            </div>

            <dl className="flex-1 divide-y divide-stone-100 text-sm">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-xs font-medium text-slate-500">
                  Luas per {product.unit}
                </dt>
                <dd className="font-semibold text-slate-900">
                  {isM2 ? `${breakdown.area} m²` : "1 pcs"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-xs font-medium text-slate-500">
                  Harga per {product.unit}
                </dt>
                <dd className="font-semibold text-slate-900">
                  {formatRupiah(breakdown.unitPrice)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-xs font-medium text-slate-500">
                  Subtotal {quantity || 1} {product.unit}
                </dt>
                <dd className="font-semibold text-slate-900">
                  {formatRupiah(breakdown.subtotal)}
                </dd>
              </div>
              {breakdown.finishingsBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <dt className="truncate text-xs font-medium text-slate-500">
                    {item.name}
                  </dt>
                  <dd className="shrink-0 font-semibold text-slate-900">
                    {formatRupiah(item.total)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 border-t border-stone-200 pt-4">
              <span className="text-xs font-medium text-slate-500">
                Estimasi total
              </span>
              <p className="text-2xl font-bold text-rose-700 sm:text-3xl">
                {formatRupiah(breakdown.total)}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                Harga final dikonfirmasi setelah desain diperiksa tim pra-cetak.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={buildWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Tanya lewat WhatsApp</span>
              </a>
              <Link
                href="/katalog"
                className="flex items-center justify-center gap-2 rounded-md border border-stone-400 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
              >
                <span>Lihat katalog produk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}