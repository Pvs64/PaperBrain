import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '100mb',
        }
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'covers.openlibrary.org' },
            { protocol: 'https', hostname: 'kbj89yo9r7flps8j.public.blob.vercel-storage.com' },
        ],
        // Disable optimization for remote images to prevent timeout issues
        unoptimized: true,
        minimumCacheTTL: 60,
    },
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
    turbopack: {
        resolveAlias: {
            fs: { browser: './empty-module.js' },
            path: { browser: './empty-module.js' },
            crypto: { browser: './empty-module.js' },
        },
    },
};

export default nextConfig;
