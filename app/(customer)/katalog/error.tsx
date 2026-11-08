"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 text-center space-y-3">
      <p className="text-sm font-semibold text-ink-700">
        Gagal memuat katalog.
      </p>
      <p className="text-xs text-ink-400">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
      >
        Coba Lagi
      </button>
    </div>
  );
}