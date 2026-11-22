"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { Scissors, Plus, Trash2, Edit, X, Loader2 } from "lucide-react";
import AdminStatCard from "@/components/AdminStatCard";

interface Props {
  initialFinishings: any[];
}

export default function FinishingsClient({ initialFinishings }: Props) {
  const [finishings, setFinishings] = useState(initialFinishings);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFinishing, setEditingFinishing] = useState<any>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(3000);
  const [unit, setUnit] = useState("m2");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreateModal() {
    setEditingFinishing(null);
    setName("");
    setPrice(3000);
    setUnit("m2");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(f: any) {
    setEditingFinishing(f);
    setName(f.name);
    setPrice(f.price);
    setUnit(f.unit);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingFinishing
        ? `/api/finishings/${editingFinishing.id}`
        : "/api/finishings";
      const method = editingFinishing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          unit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan finishing");
        setLoading(false);
        return;
      }

      if (editingFinishing) {
        setFinishings(
          finishings.map((f) => (f.id === editingFinishing.id ? data.finishing : f))
        );
      } else {
        setFinishings([data.finishing, ...finishings]);
      }

      setModalOpen(false);
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus finishing ini?")) return;

    try {
      const res = await fetch(`/api/finishings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFinishings(finishings.filter((f) => f.id !== id));
      } else {
        alert("Gagal menghapus");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Opsi finishing"
          value={finishings.length}
          caption="Layanan pasca-cetak tersedia"
          icon={Scissors}
          tone="yellow"
        />
        <AdminStatCard
          label="Total penggunaan"
          value={finishings.reduce((sum, finishing) => sum + (finishing._count?.orders || 0), 0)}
          caption="Pemakaian pada pesanan"
          icon={Plus}
          tone="mint"
        />
        <AdminStatCard
          label="Tarif rata-rata"
          value={formatRupiah(finishings.length ? Math.round(finishings.reduce((sum, finishing) => sum + finishing.price, 0) / finishings.length) : 0)}
          caption="Rata-rata biaya finishing"
          icon={Scissors}
          tone="lavender"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-xs shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Finishing Baru</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface-variant">
            <thead className="bg-surface-container-low border-b border-outline-variant text-outline font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nama Layanan Finishing</th>
                <th className="py-3.5 px-4">Biaya</th>
                <th className="py-3.5 px-4">Satuan Hitung</th>
                <th className="py-3.5 px-4 text-center">Penggunaan Order</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {finishings.map((f) => (
                <tr key={f.id} className="hover:bg-surface-container-low/80 transition">
                  <td className="py-3.5 px-4 font-bold text-on-surface">{f.name}</td>
                  <td className="py-3.5 px-4 font-extrabold text-primary">
                    {formatRupiah(f.price)}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-semibold text-on-surface-variant">
                    Per {f.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-on-surface-variant">
                    {f._count?.orders || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(f)}
                        className="p-1.5 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-bold text-sm text-on-surface">
                {editingFinishing ? "Edit Finishing" : "Tambah Finishing Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-outline hover:text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-primary bg-surface-container p-2.5 rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Nama Finishing *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Laminasi Panas Doff"
                  className="w-full p-2.5 border border-ink-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">Biaya (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-ink-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="m2 atau pcs"
                    className="w-full p-2.5 border border-ink-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-container text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFinishing ? "Simpan" : "Tambah"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
