import type { NextConfig } from 'next';

const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
eslint: {
  ignoreDuringBuilds: true,
},
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage (project-specific host injected at build time when env is set)
      ...(supabaseHost
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHost,
              pathname: '/storage/v1/object/**',
            },
          ]
        : []),
      // Mapbox static/raster tiles + thumbnails
      { protocol: 'https', hostname: 'api.mapbox.com' },
      { protocol: 'https', hostname: 'a.tiles.mapbox.com' },
      { protocol: 'https', hostname: 'b.tiles.mapbox.com' },
      { protocol: 'https', hostname: 'c.tiles.mapbox.com' },
      { protocol: 'https', hostname: 'd.tiles.mapbox.com' },
      // Google Places photo CDN (used later for place thumbnails)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
  },
  experimental: {
    // shadcn/Radix work fine with RSC; reserve flag for future enablement.
  },
};

export default nextConfig;
