"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  initialMaterials: any[];
}

export default function MaterialsClient({ initialMaterials }: Props) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [modalOpen, setModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [targetRestock, setTargetRestock] = useState<any>(null);
  const [addStockAmount, setAddStockAmount] = useState(10);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState(15000);
  const [unit, setUnit] = useState("m2");
  const [stock, setStock] = useState(100);
  const [minStock, setMinStock] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreateModal() {
    setEditingMaterial(null);
    setName("");
    setDescription("");
    setPricePerUnit(15000);
    setUnit("m2");
    setStock(100);
    setMinStock(20);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(mat: any) {
    setEditingMaterial(mat);
    setName(mat.name);
    setDescription(mat.description || "");
    setPricePerUnit(mat.pricePerUnit);
    setUnit(mat.unit);
    setStock(mat.stock);
    setMinStock(mat.minStock);
    setError("");
    setModalOpen(true);
  }

  function openRestockModal(mat: any) {
    setTargetRestock(mat);
    setAddStockAmount(20);
    setError("");
    setRestockModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingMaterial
        ? `/api/materials/${editingMaterial.id}`
        : "/api/materials";
      const method = editingMaterial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          pricePerUnit: Number(pricePerUnit),
          unit,
          stock: Number(stock),
          minStock: Number(minStock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan material");
        setLoading(false);
        return;
      }

      if (editingMaterial) {
        setMaterials(
          materials.map((m) => (m.id === editingMaterial.id ? data.material : m))
        );
      } else {
        setMaterials([...materials, data.material]);
      }

      setModalOpen(false);
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault();
    if (!targetRestock || addStockAmount <= 0) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/materials/${targetRestock.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addStock: addStockAmount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMaterials(
          materials.map((m) => (m.id === targetRestock.id ? data.material : m))
        );
        setRestockModalOpen(false);
      } else {
        alert(data.error || "Gagal menambah stok");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus material ini?")) return;

    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMaterials(materials.filter((m) => m.id !== id));
      } else {
        alert("Gagal menghapus material");
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
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Inventaris & Bahan Baku
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Manajemen Material & Stok
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau ketersediaan stok fisik dan batas aman minimal (min stock).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Material Baru</span>
        </button>
      </div>

      {/* Tabel Material */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nama Material</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4 text-right">Harga Beli / Unit</th>
                <th className="py-3.5 px-4 text-center">Stok Saat Ini</th>
                <th className="py-3.5 px-4 text-center">Min. Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => {
                const isLow = m.stock < m.minStock;
                return (
                  <tr
                    key={m.id}
                    className={`transition ${isLow ? "bg-rose-50/50" : "hover:bg-slate-50/80"}`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      {m.description && (
                        <span className="text-[10px] text-slate-400">{m.description}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold">{m.unit}</td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {formatRupiah(m.pricePerUnit)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs ${
                          isLow
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {m.stock} {m.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                      {m.minStock} {m.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Stok Rendah</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aman</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openRestockModal(m)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                          title="Tambah Stok"
                        >
                          <ArrowUpCircle className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(m)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Material */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingMaterial ? "Edit Material" : "Tambah Material Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Material *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Flexi Korea 440gr"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Karakteristik atau spesifikasi bahan"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Beli / Unit (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="m2 atau pcs"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Minimal Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMaterial ? "Simpan" : "Tambah"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restock Cepat */}
      {restockModalOpen && targetRestock && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Restock: {targetRestock.name}
              </h3>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Stok Saat Ini:</span>
                <p className="font-extrabold text-sm text-slate-900">
                  {targetRestock.stock} {targetRestock.unit}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jumlah Tambahan Stok ({targetRestock.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addStockAmount}
                  onChange={(e) => setAddStockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || addStockAmount <= 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tambah Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
