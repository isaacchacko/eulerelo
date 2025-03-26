// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Externalize bcrypt modules
    config.externals.push('bcrypt', 'bcryptjs');
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  },
  experimental: {
    serverActions: {
      // Required for secure cookie handling
    }
  }
};

export default nextConfig;
