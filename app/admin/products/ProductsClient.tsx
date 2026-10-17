"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { Package, Plus, Trash2, Edit, X, Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";

interface Props {
  initialProducts: any[];
}

export default function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outdoor");
  const [basePrice, setBasePrice] = useState(20000);
  const [unit, setUnit] = useState<"m2" | "pcs">("m2");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreateModal() {
    setEditingProduct(null);
    setName("");
    setSlug("");
    setDescription("");
    setCategory("Outdoor");
    setBasePrice(20000);
    setUnit("m2");
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(prod: any) {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description);
    setCategory(prod.category);
    setBasePrice(prod.basePrice);
    setUnit(prod.unit);
    setImageUrl(prod.imageUrl || "");
    setImageFile(null);
    setImagePreview(prod.imageUrl || "");
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalImageUrl = imageUrl;

      // Jika admin mengunggah file gambar baru
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setError(uploadData.error || "Gagal mengunggah gambar produk");
          setLoading(false);
          return;
        }

        finalImageUrl = uploadData.url;
      }

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          category,
          basePrice: Number(basePrice),
          unit,
          imageUrl: finalImageUrl ? finalImageUrl.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan produk");
        setLoading(false);
        return;
      }

      if (editingProduct) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? data.product : p)));
      } else {
        setProducts([data.product, ...products]);
      }

      setModalOpen(false);
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Master Data
          </span>
          <h1 className="text-2xl font-black text-ink-900 mt-1">
            Kelola Katalog Produk
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Daftar produk cetak yang dapat dipesan oleh pelanggan di web.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-3xl border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-700">
            <thead className="bg-ink-50 border-b border-ink-200 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4 text-right">Harga Dasar</th>
                <th className="py-3.5 px-4 text-center">Total Order</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-ink-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-100 overflow-hidden shrink-0">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block">{p.name}</span>
                      <span className="text-[10px] text-ink-400 font-normal">
                        slug: /{p.slug}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-ink-100 font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold uppercase">{p.unit}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-brand-600">
                    {formatRupiah(p.basePrice)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-ink-700">
                    {p._count?.orders || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-ink-500 hover:text-brand-600 hover:bg-ink-100 rounded-lg transition"
                        title="Edit Produk"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-ink-500 hover:text-brand-600 hover:bg-ink-100 rounded-lg transition"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Produk */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-ink-100">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-bold text-sm text-ink-900">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-ink-400 hover:text-ink-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-brand-50 text-brand-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-ink-700 block mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingProduct) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  className="w-full p-2.5 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full p-2.5 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Kategori *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Outdoor / Indoor / Stationery"
                    className="w-full p-2.5 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Harga Dasar (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Satuan Hitung *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as "m2" | "pcs")}
                    className="w-full p-2.5 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                  >
                    <option value="m2">m2 (Meter Persegi)</option>
                    <option value="pcs">pcs (Per Lembar / Kotak)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1.5">
                  Foto / Gambar Produk
                </label>
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-2xl border border-ink-200 overflow-hidden group bg-ink-50 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview Produk"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-ink-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 bg-white text-ink-800 text-xs font-semibold rounded-xl cursor-pointer hover:bg-ink-100 shadow-sm transition">
                        Ganti Foto
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setImageFile(f);
                              setImagePreview(URL.createObjectURL(f));
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setImageUrl("");
                        }}
                        className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-sm transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-ink-300 hover:border-brand-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-ink-50/60 hover:bg-brand-50/30">
                    <Upload className="w-6 h-6 text-ink-400 mb-1" />
                    <span className="text-xs font-semibold text-ink-700">
                      Klik untuk unggah foto produk
                    </span>
                    <span className="text-[10px] text-ink-400">
                      Format: JPG, PNG, atau WEBP (Maks. 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setImageFile(f);
                          setImagePreview(URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">Deskripsi Produk *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-ink-200 text-ink-600 font-semibold rounded-xl hover:bg-ink-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Simpan Perubahan" : "Buat Produk"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
