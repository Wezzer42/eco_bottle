/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE || '';
    return [
      {
        source: '/api/backend/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};
export default nextConfig;

