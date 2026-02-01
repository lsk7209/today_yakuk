/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    compress: true,
    poweredByHeader: false,
    swcMinify: true,
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
};

export default nextConfig;
