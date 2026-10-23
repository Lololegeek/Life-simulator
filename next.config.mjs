// Project pages are served from https://<user>.github.io/<repo>, so the build needs that prefix.
const repo = 'Life-simulator';
const isPages = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isPages ? `/${repo}` : '',
  assetPrefix: isPages ? `/${repo}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'lodash-es', 'date-fns'],
  },
};

export default nextConfig;
