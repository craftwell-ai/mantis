import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the parent folder otherwise
  // makes Next infer ~/projects as the root.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  // Storybook's build loads its files by relative path, so its page must stay
  // at /storybook/ with the slash; Next strips trailing slashes by default.
  trailingSlash: true,
  // Next does not serve a folder's index.html on its own.
  async rewrites() {
    return [{ source: '/storybook/', destination: '/storybook/index.html' }]
  },
}

export default nextConfig
