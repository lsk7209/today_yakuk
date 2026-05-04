/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.todaypharm.kr',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: ['/server-sitemap.xml', '/admin/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: 'Bytespider',
                disallow: '/',
            },
            {
                userAgent: ['Yeti', 'Daumoa', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot', 'Google-Extended', 'anthropic-ai'],
                allow: '/',
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api/admin'],
            },
        ],
    },
}
