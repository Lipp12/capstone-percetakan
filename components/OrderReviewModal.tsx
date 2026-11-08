"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import OrderReviewCard from "./OrderReviewCard";

interface Props {
  orderId: string;
  orderNumber: string;
  productName: string;
  orderStatus: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string | Date;
  } | null;
}

export default function OrderReviewModal({
  orderId,
  orderNumber,
  productName,
  orderStatus,
  existingReview,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(existingReview || null);

  // Fitur ulasan hanya berlaku untuk pesanan COMPLETED
  if (orderStatus !== "COMPLETED") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`px-3 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
          currentReview
            ? "border border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100/80"
            : "bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
        }`}
        title={currentReview ? "Lihat atau ubah ulasan Anda" : "Beri ulasan untuk pesanan ini"}
      >
        <Star
          className={`w-3.5 h-3.5 ${
            currentReview ? "fill-amber-500 text-amber-500" : "fill-white text-white"
          }`}
        />
        <span>
          {currentReview ? `Diulas (${currentReview.rating}★)` : "Beri Ulasan"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition z-10"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-1">
              <OrderReviewCard
                orderId={orderId}
                orderNumber={orderNumber}
                productName={productName}
                orderStatus={orderStatus}
                existingReview={currentReview}
                onSuccess={() => {
                  // Review updated/saved
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

