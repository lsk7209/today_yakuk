"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

type CopyButtonProps = {
  text: string;
  label: string;
  className?: string;
};

export function CopyButton({ text, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCopy = useCallback(async () => {
    setError(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError("복사에 실패했습니다. 길게 눌러 직접 복사해 주세요.");
    }
  }, [text]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        className={
          className ??
          "inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 hover:border-brand-300 hover:bg-brand-50"
        }
        aria-label={label}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
        <span>{copied ? "복사됨" : "복사"}</span>
      </button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}


