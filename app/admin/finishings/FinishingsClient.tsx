"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { Scissors, Plus, Trash2, Edit, X, Loader2 } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Layanan Tambahan
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Kelola Opsi Finishing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pekerjaan finishing pasca-cetak (mata ayam, laminasi, lipat, box).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Finishing Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nama Layanan Finishing</th>
                <th className="py-3.5 px-4">Biaya</th>
                <th className="py-3.5 px-4">Satuan Hitung</th>
                <th className="py-3.5 px-4 text-center">Penggunaan Order</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finishings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{f.name}</td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-600">
                    {formatRupiah(f.price)}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-semibold text-slate-700">
                    Per {f.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {f._count?.orders || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(f)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingFinishing ? "Edit Finishing" : "Tambah Finishing Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Finishing *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Laminasi Panas Doff"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Biaya (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
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
