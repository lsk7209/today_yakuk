/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://todayyakuk.com',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: ['/server-sitemap.xml', '/admin/*'],
    robotsTxtOptions: {
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://todayyakuk.com'}/server-sitemap.xml`,
        ],
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api/admin'],
            },
        ],
    },
}
