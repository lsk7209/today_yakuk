/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: process.env.MIGRATION_STAGING === "1",
  outputFileTracingIncludes: {
    "/*": ["./content/**/*", "./node_modules/@libsql/**/*"],
  },
  images: {
    localPatterns: [{ pathname: "/**", search: "" }, { pathname: "/api/og" }],
    remotePatterns: [{
      protocol: "https",
      hostname: "nedrug.mfds.go.kr",
      port: "",
      pathname: "/pbp/cmn/itemImageDownload/**",
      search: "",
    }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      ...(process.env.MIGRATION_STAGING === "1" ? [{
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      }] : []),
      {
        source: "/(about|contact|terms|privacy|guide|guide/:path*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(blog|wiki)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/(pharmacy|hub)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(sitemap-index.xml|sitemap.xml|rss.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async redirects() {
    // 의도가 겹치는 블로그 글을 대표 글로 통합 (301)
    return [
      { source: "/blog/night-pharmacy-checklist", destination: "/blog/night-pharmacy-3steps", permanent: true },
      { source: "/blog/night-radius-tips", destination: "/blog/night-pharmacy-3steps", permanent: true },
      { source: "/blog/holiday-open-pharmacy-tips", destination: "/blog/holiday-pharmacy-open-check", permanent: true },
      { source: "/blog/kids-fever-meds-check", destination: "/blog/kids-fever-medicine-comparison", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/sitemap-index.xml",
      },
    ];
  },
};

export default nextConfig;
