import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Runs every story as a browser test in headless Chromium. The a11y addon
// checks each one with axe (preview.tsx sets a11y.test to 'error'); since
// Storybook 10.3 addon-vitest applies the preview and addon annotations itself,
// so there is no setup file.
export default defineConfig({
  // A git worktree may share the main checkout's node_modules through a
  // symlink; Vite refuses files outside the root unless their real path is
  // allowed, and every story then fails to load.
  server: { fs: { allow: [dirname, fs.realpathSync(path.join(dirname, 'node_modules'))] } },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
