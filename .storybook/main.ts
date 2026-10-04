import type { StorybookConfig } from '@storybook/nextjs-vite'
import remarkGfm from 'remark-gfm'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      // Storybook's MDX no longer parses markdown tables by default; remark-gfm restores them.
      name: '@storybook/addon-docs',
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    // Serves an MCP endpoint at /mcp on the dev server and writes component
    // manifests into the static build, so agents can read the catalog.
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  // The sidebar logo; theme.ts points brandImage at /brand/mantis-logo.svg.
  staticDirs: [{ from: './brand', to: '/brand' }],
}

export default config
