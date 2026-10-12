"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { buildWikiMedicinePath, buildWikiProductPath } from "@/lib/wiki-slug";
import type { WikiCatalogType } from "@/lib/wiki-catalog";

interface Supplement {
    id: string;
    name: string;
    manufacturer: string | null;
    image_url: string | null;
    tags: string[] | null;
}

interface WikiSearchProps {
    currentCategory?: string;
    type?: WikiCatalogType;
}

export default function WikiSearch({ currentCategory = "all", type = "supplement" }: WikiSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Supplement[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Cancel pending responses when the query or catalog changes.
    useEffect(() => {
        const controller = new AbortController();
        setResults([]);
        setShowResults(false);
        setIsSearching(false);
        if (query.trim().length < 2) return () => controller.abort();

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const params = new URLSearchParams({ q: query.trim(), limit: "6" });
                if (type === "medicine") params.set("type", "medicine");
                if (type === "supplement" && currentCategory !== "all") params.set("category", currentCategory);
                const res = await fetch(`/api/wiki/search?${params}`, { signal: controller.signal });
                const data = await res.json();
                if (!controller.signal.aborted && data.success) {
                    setResults(data.products);
                    setShowResults(true);
                }
            } catch (error) {
                if (!controller.signal.aborted) console.error("Search error:", error);
            } finally {
                if (!controller.signal.aborted) setIsSearching(false);
            }
        }, 300);

        return () => { clearTimeout(timer); controller.abort(); };
    }, [query, currentCategory, type]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".wiki-search-container")) {
                setShowResults(false);
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    return (
        <div className="relative max-w-2xl mx-auto wiki-search-container">
            <input
                type="text"
                aria-label={type === "medicine" ? "의약품 이름이나 제조사 검색" : "제품명이나 제조사 검색"}
                placeholder={type === "medicine" ? "의약품 이름이나 제조사를 검색하세요" : "찾으시는 제품명이나 제조사를 검색하세요"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                className="w-full px-12 py-4 bg-[var(--white)] border-2 border-[var(--ink)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--ink)] text-base font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5" />

            {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!isSearching && query.length >= 2 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-50 text-[var(--muted)] text-[10px] font-black rounded-md border border-slate-100">
                    {results.length}건
                </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--white)] border-2 border-[var(--ink)] rounded-none z-50 max-h-96 overflow-y-auto">
                    {results.map((product) => (
                        <Link
                            key={product.id}
                            href={type === "medicine" ? buildWikiMedicinePath(product) : buildWikiProductPath(product)}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                            onClick={() => setShowResults(false)}
                        >
                            <div className="w-12 h-12 shrink-0 bg-[var(--fog)] border border-[var(--ink)] overflow-hidden flex items-center justify-center">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="object-contain p-1"
                                    />
                                ) : (
                                    <span className="text-2xl">💊</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{product.name}</p>
                                <p className="text-xs text-[var(--muted)] truncate">{product.manufacturer || "공시 데이터 없음"}</p>
                            </div>
                        </Link>
                    ))}
                    {results.length >= 6 && (
                        <div className="p-3 text-center text-sm text-[var(--muted)] bg-slate-50 rounded-none">
                            더 많은 결과를 보려면 구체적으로 검색하세요
                        </div>
                    )}
                </div>
            )}

            {/* No results */}
            {showResults && query.length >= 2 && results.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--white)] border-2 border-[var(--ink)] rounded-none z-50 p-8 text-center">
                    <p className="text-[var(--muted)]">검색 결과가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
