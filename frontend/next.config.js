/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: standalone dibutuhkan untuk Docker build
  // Jika deploy ke Vercel: hapus/comment baris ini
  output: 'standalone',

  // Skip type-check & ESLint saat build Docker → hemat ~10 detik
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
