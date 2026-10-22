/**
 * Deterministic SVG blog image generator for editorial posts.
 * Generates 10 unique 1200x630 branded SVG assets.
 * Run: npx tsx scripts/generate-editorial-svgs.ts
 */
import * as fs from "fs";
import * as path from "path";

interface PostMeta {
  slug: string;
  title: string;
  icon: string;
  accentColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
}

const posts: PostMeta[] = [
  { slug: "editorial-medicine-info-check", title: "의약품 정보 확인 순서", icon: "💊", accentColor: "#059669", bgGradientFrom: "#ecfdf5", bgGradientTo: "#d1fae5" },
  { slug: "editorial-same-ingredient-compare", title: "동일 성분 의약품 비교", icon: "⚖️", accentColor: "#0891b2", bgGradientFrom: "#ecfeff", bgGradientTo: "#cffafe" },
  { slug: "editorial-pharmacy-stock-inquiry", title: "약국 재고 문의 준비", icon: "📋", accentColor: "#7c3aed", bgGradientFrom: "#f5f3ff", bgGradientTo: "#ede9fe" },
  { slug: "editorial-adverse-reaction-record", title: "이상반응 기록·상담", icon: "📝", accentColor: "#dc2626", bgGradientFrom: "#fef2f2", bgGradientTo: "#fee2e2" },
  { slug: "editorial-storage-label-reading", title: "보관 조건 라벨 읽기", icon: "🌡️", accentColor: "#ea580c", bgGradientFrom: "#fff7ed", bgGradientTo: "#ffedd5" },
  { slug: "editorial-health-food-info", title: "건강기능식품 기능정보", icon: "🏷️", accentColor: "#16a34a", bgGradientFrom: "#f0fdf4", bgGradientTo: "#dcfce7" },
  { slug: "editorial-supplement-overlap", title: "영양제 성분 중복 점검", icon: "🔍", accentColor: "#2563eb", bgGradientFrom: "#eff6ff", bgGradientTo: "#dbeafe" },
  { slug: "editorial-medication-schedule", title: "약 복용 일정표", icon: "📅", accentColor: "#9333ea", bgGradientFrom: "#faf5ff", bgGradientTo: "#f3e8ff" },
  { slug: "editorial-travel-medicine-prep", title: "여행 전 약 준비", icon: "✈️", accentColor: "#0d9488", bgGradientFrom: "#f0fdfa", bgGradientTo: "#ccfbf1" },
  { slug: "editorial-pharmacy-counseling-record", title: "복약지도 기록법", icon: "💬", accentColor: "#4f46e5", bgGradientFrom: "#eef2ff", bgGradientTo: "#e0e7ff" },
];

function generateSvg(post: PostMeta): string {
  // Escape XML entities in title
  const safeTitle = post.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${safeTitle} - TodayPharm">
  <defs>
    <linearGradient id="bg-${post.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${post.bgGradientFrom}"/>
      <stop offset="100%" style="stop-color:${post.bgGradientTo}"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg-${post.slug})"/>
  <!-- Decorative circle -->
  <circle cx="950" cy="150" r="180" fill="${post.accentColor}" opacity="0.06"/>
  <circle cx="200" cy="500" r="120" fill="${post.accentColor}" opacity="0.04"/>
  <!-- Top bar -->
  <rect x="0" y="0" width="1200" height="6" fill="${post.accentColor}"/>
  <!-- Brand -->
  <text x="80" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="${post.accentColor}">TodayPharm</text>
  <text x="80" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#6b7280">약국오늘 블로그</text>
  <!-- Icon -->
  <text x="80" y="320" font-size="80">${post.icon}</text>
  <!-- Title -->
  <text x="200" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#1f2937">${safeTitle}</text>
  <!-- Subtitle -->
  <text x="80" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#6b7280">안전한 복약 생활을 위한 실용 가이드</text>
  <!-- Bottom decorative line -->
  <rect x="80" y="500" width="120" height="4" rx="2" fill="${post.accentColor}"/>
  <!-- Domain -->
  <text x="80" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#9ca3af">todaypharm.kr/blog</text>
</svg>`;
}

const outDir = path.join(process.cwd(), "public", "blog-images");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let count = 0;
for (const post of posts) {
  const svg = generateSvg(post);
  const filePath = path.join(outDir, `${post.slug}.svg`);
  fs.writeFileSync(filePath, svg, "utf-8");
  count++;
  console.log(`✓ Generated: ${post.slug}.svg`);
}
console.log(`\nDone: ${count} SVG images generated in public/blog-images/`);
