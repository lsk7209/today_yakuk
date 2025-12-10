type Props = {
  label?: string;
  className?: string;
  height?: number; // px, optional override
};

export function AdsPlaceholder({ label = "광고 표시 영역", className, height }: Props) {
  const style = height ? { minHeight: `${height}px` } : undefined;
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-gray-100 px-4 text-sm text-slate-500 min-h-[140px] sm:min-h-[150px] lg:min-h-[160px] ${className ?? ""}`}
      style={style}
      aria-label={label}
    >
      {label}
    </div>
  );
}

