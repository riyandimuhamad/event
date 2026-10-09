/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eventops/shared', '@eventops/db'],
};

export default nextConfig;
