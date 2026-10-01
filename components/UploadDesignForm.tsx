"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface Props {
  orderId: string;
  orderNumber: string;
  existingFileUrl?: string | null;
}

export default function UploadDesignForm({
  orderId,
  orderNumber,
  existingFileUrl,
}: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [designNotes, setDesignNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 20 * 1024 * 1024) {
        setError("Ukuran file melebihi 20MB");
        return;
      }
      setError("");
      setFile(selected);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !existingFileUrl) {
      setError("Pilih file desain terlebih dahulu");
      return;
    }

    if (!file && existingFileUrl) {
      // Jika sudah ada file dan user ingin langsung lanjut ke checkout
      router.push(`/checkout/${orderId}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("designNotes", designNotes);

      const res = await fetch(`/api/orders/${orderId}/upload-design`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengunggah file");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/checkout/${orderId}`);
      }, 1500);
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>File berhasil diunggah! Mengalihkan ke pembayaran...</span>
        </div>
      )}

      {/* Area Dropzone File */}
      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 text-center bg-slate-50/60 transition cursor-pointer relative">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.zip"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {file ? file.name : "Klik atau seret file desain ke sini"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Format yang didukung: PDF, JPG, PNG, AI, PSD, ZIP (Maksimal 20MB)
            </p>
          </div>
          {file && (
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              Ukuran: {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          )}
        </div>
      </div>

      {existingFileUrl && !file && (
        <p className="text-xs text-slate-500 bg-slate-100 p-3 rounded-xl flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>
            Sudah ada file yang terunggah sebelumnya:{" "}
            <a
              href={existingFileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-semibold underline"
            >
              Lihat File
            </a>
          </span>
        </p>
      )}

      {/* Catatan Desain */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
          Catatan Tambahan Mengenai Desain (Opsional)
        </label>
        <textarea
          rows={3}
          value={designNotes}
          onChange={(e) => setDesignNotes(e.target.value)}
          placeholder="Contoh: Tolong jangan dipotong bagian tulisan bawah, warna background hitam pekat..."
          className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
        />
      </div>

      {/* Tombol Simpan & Lanjut */}
      <button
        type="submit"
        disabled={loading || isSuccess}
        className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengunggah File...</span>
          </>
        ) : (
          <>
            <span>Konfirmasi & Lanjut ke Pembayaran</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
