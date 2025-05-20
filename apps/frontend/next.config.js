/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Konfigurasi untuk redirect dari halaman utama ke halaman video
  async redirects() {
    return [
      {
        source: '/',
        destination: '/video',
        permanent: true,
      },
    ];
  },
  // Konfigurasi untuk proxy API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:4000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
