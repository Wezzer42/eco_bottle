/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    return [
      {
        source: '/api/backend/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};
export default nextConfig;

