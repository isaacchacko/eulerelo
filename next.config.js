// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing config
  webpack: (config) => {
    config.externals.push('bcrypt', 'bcryptjs');
    return config;
  },
  
  // Add Socket.io rewrites
  async rewrites() {
    return [
      {
        source: "/api/socket/:path*",
        destination: "/api/socket/io",
      },
    ];
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
          },
          {
            key: 'Upgrade',
            value: 'websocket'
          },
          {
            key: 'Connection',
            value: 'Upgrade'
          }
        ]
      }
    ];
  },

  experimental: {
    serverActions: {
      allowedForwardedHosts: [
        process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '') || 'localhost:3000'
      ]
    }
  }
};

module.exports = nextConfig;
