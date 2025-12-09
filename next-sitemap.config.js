/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    ),
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/api/*"],
  transform: async (config, path) => {
    // 향후 동적 경로 추가 시 여기서 우선순위 조정 가능
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: path.startsWith("/pharmacy/") ? 0.9 : config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};

