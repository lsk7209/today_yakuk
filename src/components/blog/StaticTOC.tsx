"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TocEntry {
  id: string;
  text: string;
  level?: 2 | 3;
}

interface StaticTOCProps {
  items: TocEntry[];
}

export default function StaticTOC({ items }: StaticTOCProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      className="rounded-2xl border border-slate-100 bg-slate-50 p-5 mb-8"
      aria-label="목차"
    >
      <div className="flex items-center gap-2 mb-3">
        <List className="h-4 w-4 text-brand-600" />
        <span className="text-sm font-bold text-slate-900">목차</span>
      </div>
      <ol className="space-y-1.5">
        {items.map(({ id, text, level = 2 }) => (
          <li key={id} className={level === 3 ? "ml-4" : ""}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`block rounded-lg px-3 py-1 text-sm transition-all ${
                activeId === id
                  ? "bg-brand-100 font-semibold text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
