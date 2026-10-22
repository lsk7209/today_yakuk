"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type TocItem = { id: string; label: string };

export default function EditorialToc({ section }: { section: "guide" | "blog" | "wiki" }) {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[] | null>(null);

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

  if (items !== null && items.length < 2) return null;

  // 하이드레이션 후 항목을 채워도 본문이 밀리지 않도록(CLS) 접힌 틀을 서버 HTML에 먼저 렌더한다.
  return (
    <nav className="city-editorial-toc" aria-label="본문 목차">
      <details>
        <summary className="city-eyebrow">ON THIS PAGE / 목차{items ? ` (${items.length})` : ""}</summary>
        <ol>
          {(items ?? []).map((item, index) => (
            <li key={item.id}>
              <a href={`#${item.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
