"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type TocItem = { id: string; label: string };

export default function EditorialToc({ section }: { section: "guide" | "blog" | "wiki" }) {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const article = document.querySelector(
      `.city-editorial-${section} .city-route-article`,
    );
    if (!article) {
      setItems([]);
      return;
    }

    const headings = Array.from(article.querySelectorAll("h2"));
    setItems(headings.map((heading, index) => {
      const id = heading.id || `editorial-${section}-${index + 1}`;
      if (!heading.id) heading.id = id;
      return { id, label: heading.textContent?.trim() || `본문 ${index + 1}` };
    }));
  }, [pathname, section]);

  if (items.length < 2) return null;

  return (
    <nav className="city-editorial-toc" aria-label="본문 목차">
      <p className="city-eyebrow">ON THIS PAGE / 목차</p>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
