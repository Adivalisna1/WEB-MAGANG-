/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type-check & ESLint saat build Docker → hemat ~10 detik
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
