export default function Loading() {
  return (
    <div className="container py-10 sm:py-14 space-y-4">
      <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-3 animate-pulse">
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-200 rounded-full" />
          <div className="h-8 w-24 bg-slate-200 rounded-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-3 animate-pulse">
        <div className="h-4 w-28 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="h-14 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

