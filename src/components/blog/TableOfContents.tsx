"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    contentHtml: string;
}

export default function TableOfContents({ contentHtml }: TableOfContentsProps) {
    const [tocItems, setTocItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // HTML에서 h2, h3 헤딩 추출
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, "text/html");
        const headings = doc.querySelectorAll("h2, h3");

        const items: TocItem[] = [];
        headings.forEach((heading, index) => {
            const id = heading.id || `heading-${index}`;
            items.push({
                id,
                text: heading.textContent || "",
                level: parseInt(heading.tagName[1]),
            });
        });

        setTocItems(items);
    }, [contentHtml]);

    useEffect(() => {
        // 스크롤 시 현재 활성 헤딩 추적
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -80% 0px" }
        );

        tocItems.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [tocItems]);

    if (tocItems.length < 2) return null;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <nav className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <List className="w-5 h-5 text-brand-600" />
                <span className="font-bold text-slate-900">목차</span>
            </div>
            <ul className="space-y-2">
                {tocItems.map((item) => (
                    <li
                        key={item.id}
                        className={`${item.level === 3 ? "ml-4" : ""}`}
                    >
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={`block py-1 px-3 rounded-lg text-sm transition-all ${activeId === item.id
                                    ? "bg-brand-100 text-brand-700 font-medium"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
