"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  /** Class untuk placeholder saat gambar gagal dimuat / tidak ada. */
  fallbackClassName?: string;
}

/**
 * Gambar produk dengan fallback otomatis.
 *
 * Sebagian gambar produk di-seed memakai hotlink eksternal (Unsplash). URL
 * tersebut bisa mati kapan saja (foto dihapus, link berubah) dan tidak bisa
 * kita kontrol. Tanpa ini, produk akan menampilkan ikon gambar rusak.
 * Instead fallback-nya ke placeholder ikon Tag.
 */
export default function ProductImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-rose-700 bg-rose-50 ${fallbackClassName}`}
      >
        <Tag className="w-9 h-9" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}