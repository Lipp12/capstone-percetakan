"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, AlertCircle, Loader2, Edit3 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ExistingReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
}

interface Props {
  orderId: string;
  orderNumber: string;
  productName: string;
  orderStatus: string;
  existingReview?: ExistingReview | null;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Sangat Kecewa", color: "text-red-500" },
  2: { text: "Kurang Puas", color: "text-amber-600" },
  3: { text: "Cukup / Standar", color: "text-amber-500" },
  4: { text: "Puas / Kualitas Bagus", color: "text-emerald-600" },
  5: { text: "Sangat Puas / Istimewa!", color: "text-emerald-700" },
};

export default function OrderReviewCard({
  orderId,
  orderNumber,
  productName,
  orderStatus,
  existingReview: initialReview,
  onSuccess,
}: Props) {
  const [review, setReview] = useState<ExistingReview | null>(initialReview || null);
  const [isEditing, setIsEditing] = useState<boolean>(!initialReview);
  const [rating, setRating] = useState<number>(initialReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialReview?.comment || "");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(initialReview === undefined);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Ambil data ulasan secara otomatis jika tidak disediakan via props
  useEffect(() => {
    if (initialReview === undefined && orderStatus === "COMPLETED") {
      fetch(`/api/orders/${orderId}/review`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.review) {
            setReview(data.review);
            setRating(data.review.rating);
            setComment(data.review.comment || "");
            setIsEditing(false);
          }
        })
        .catch((err) => console.warn("[OrderReviewCard] Gagal memuat ulasan:", err))
        .finally(() => setLoadingInitial(false));
    }
  }, [orderId, orderStatus, initialReview]);

  // Jika status pesanan belum selesai, tidak menampilkan form ulasan
  if (orderStatus !== "COMPLETED") {
    return null;
  }

  if (loadingInitial) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span>Memuat data ulasan...</span>
      </div>
    );
  }

  const activeStarCount = hoverRating || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulasan");
      }

      setReview(data.data);
      setIsEditing(false);
      setFeedback({
        type: "success",
        message: data.message || "Ulasan berhasil dikirim!",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Terjadi kesalahan saat menyimpan ulasan.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Tampilan saat ulasan sudah ada dan tidak dalam mode edit
  if (review && !isEditing) {
    return (
      <div className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 rounded-3xl border border-amber-200/70 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ulasan Anda untuk Pesanan Ini</h3>
              <p className="text-xs text-slate-500">
                Dikirim pada {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-amber-800 hover:bg-amber-50 transition shadow-2xs self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Ubah Ulasan</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">
              {review.rating}/5
            </span>
            <span className={`text-xs font-semibold ${RATING_LABELS[review.rating]?.color || ""}`}>
              • {RATING_LABELS[review.rating]?.text}
            </span>
          </div>

          {review.comment ? (
            <p className="text-xs sm:text-sm text-slate-700 bg-white/80 p-3.5 rounded-2xl border border-amber-100/80 leading-relaxed italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Tidak ada ulasan tertulis.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Tampilan Form Input / Edit Ulasan
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Ulasan Pelanggan
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {review ? "Ubah Ulasan Anda" : "Bagaimana Kualitas Cetakan Anda?"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Berikan nilai dan masukan untuk pesanan <strong>#{orderNumber}</strong> ({productName}).
          </p>
        </div>
        {review && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Batal Ubah
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating Bintang */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Kepuasan Bintang <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= activeStarCount;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:scale-110 active:scale-95 transition focus:outline-none"
                    aria-label={`Beri bintang ${star}`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition ${
                        filled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300 hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold">
              <span className="text-slate-900 font-bold text-sm mr-1.5">
                {activeStarCount} / 5
              </span>
              <span className={RATING_LABELS[activeStarCount]?.color}>
                {RATING_LABELS[activeStarCount]?.text}
              </span>
            </div>
          </div>
        </div>

        {/* Textarea Masukan / Ulasan */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Ulasan & Masukan Anda (Opsional)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {comment.length}/1000
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Ceritakan kepuasan Anda terhadap ketajaman warna, kualitas bahan, kecepatan selesai, atau pelayanan kami..."
            className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition resize-none"
          />
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end gap-3 pt-1">
          {review && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4 fill-white" />
                <span>{review ? "Simpan Perubahan Ulasan" : "Kirim Ulasan"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

