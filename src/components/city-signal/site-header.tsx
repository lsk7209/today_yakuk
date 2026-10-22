"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site-config";

const links = [
  ["/", "홈"], ["/nearby", "약국 찾기"], ["/guide", "가이드"],
  ["/blog", "블로그"], ["/wiki", "영양제 정보"], ["/about", "소개"],
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="city-signal-bar"><span>PHARMACY / LOCAL WAYFINDING SYSTEM</span><span>공공데이터 · 방문 전 전화 확인</span></div>
      <header className="city-site-header">
        <div className="city-header-inner">
          <Link href="/" className="city-brand" onClick={() => setOpen(false)} aria-label={`${SITE_NAME} 홈`}>
            <span className="city-brand-mark" aria-hidden="true">✳</span>
            <span>{SITE_NAME}<small>YOUR CITY. YOUR WAY.</small></span>
          </Link>
          <button className="city-menu-toggle" aria-expanded={open} aria-controls="city-primary-nav" onClick={() => setOpen(!open)}>{open ? "메뉴 닫기 −" : "메뉴 열기 +"}</button>
          <nav id="city-primary-nav" className="city-primary-nav" data-open={open} aria-label="주 메뉴" onKeyDown={event => { if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".city-menu-toggle")?.focus(); } }}>
            {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
          </nav>
          <Link href="/nearby" className="city-nav-cta">내 주변 찾기 ↗</Link>
        </div>
      </header>
    </>
  );
}
