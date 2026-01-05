/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    '@trezoa-commerce/connector',
    '@trezoa-commerce/react',
    '@trezoa-commerce/headless'
  ],
  experimental: {
    optimizePackageImports: ['@trezoa-commerce/connector', '@trezoa-commerce/headless', '@trezoa-commerce/react'],
  },
  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      // Ensure React is properly resolved
      'react': 'react',
      'react-dom': 'react-dom',
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  // Disable static generation for error pages to fix SSR context issue
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
};

export default config;
