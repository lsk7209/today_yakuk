export function AdsPlaceholder({ label = "광고 표시 영역" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-gray-100 px-4 py-6 text-sm text-slate-500">
      {label}
    </div>
  );
}

