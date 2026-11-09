export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-ink-200 rounded" />
      <div className="h-4 w-72 bg-ink-100 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-ink-100 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}