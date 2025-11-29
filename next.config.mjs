/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["picsum.photos"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["http://localhost:3000"],
    },
  },
};

export default nextConfig;
