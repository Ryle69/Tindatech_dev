/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['yppwblvzooypyfvbtsiq.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yppwblvzooypyfvbtsiq.supabase.co',
        pathname: '/storage/v1/object/public/products/**',
      },
    ],
  },
}

export default nextConfig
