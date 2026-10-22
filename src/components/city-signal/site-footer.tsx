import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export default function SiteFooter() {
  return (
    <footer className="city-site-footer">
      <div className="city-footer-top">
        <div><Link href="/" className="city-brand"><span aria-hidden="true" className="city-brand-mark">✳</span>{SITE_NAME}</Link><p>우리 동네 약국을 찾는 길 안내.<br />등록 시간표와 현장 운영은 다를 수 있습니다.<br />방문 전 전화로 영업 여부와 재고를 확인하세요.</p></div>
        <nav aria-label="서비스 바로가기"><small>EXPLORE / QUICK LINKS</small><Link href="/nearby">내 주변 약국 ↗</Link><Link href="/guide">약국 이용 가이드 ↗</Link><Link href="/blog">블로그 ↗</Link><Link href="/wiki">영양제 정보 ↗</Link></nav>
        <nav aria-label="서비스 정책"><small>ABOUT / TRUST & SUPPORT</small><Link href="/about">소개</Link><Link href="/contact">문의</Link><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보 처리방침</Link></nav>
      </div>
      <div className="city-footer-micro"><span>© {new Date().getFullYear()} {SITE_NAME} TodayPharmacy</span><span>FIND / CHECK / CALL</span></div>
    </footer>
  );
}
