export default function Loading() {
  return (
    <div className="container py-10 sm:py-14 space-y-4">
      <div className="h-6 w-48 rounded-full bg-slate-200 animate-pulse" />
      {[...Array(4)].map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-3 w-16 bg-slate-100 rounded-full" />
          </div>
          <div className="h-5 w-2/3 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="flex gap-2">
            <div className="h-7 w-24 bg-slate-200 rounded-full" />
            <div className="h-7 w-24 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

