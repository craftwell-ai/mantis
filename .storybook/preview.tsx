import { useEffect } from 'react'
import type { Decorator, Preview } from '@storybook/nextjs-vite'
import '../app/globals.css'
import { theme } from './theme'
import { themeModes, accents } from './manager-theme.generated.mjs'

// Every mode this registry ships, and every accent if it has any. data-theme
// goes on <html> — the attribute consumers are required to set — so portaled
// content (dialogs, dropdowns, toasts) switches too; the wrapper paints the
// page ground behind every story.
const WithTheme: Decorator = (Story, context) => {
  const mode = themeModes.includes(context.globals.theme) ? context.globals.theme : themeModes[0]
  const accent = accents.includes(context.globals.accent) ? context.globals.accent : null
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    if (accent) document.documentElement.setAttribute('data-accent', accent)
    else document.documentElement.removeAttribute('data-accent')
  }, [mode, accent])
  return (
    <div data-theme={mode} data-accent={accent ?? undefined} className="bg-background p-6 font-sans text-foreground">
      <Story />
    </div>
  )
}

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: themeModes[0],
    toolbar: { icon: 'circlehollow', items: themeModes.map((mode: string) => ({ value: mode, title: mode })), dynamicTitle: true },
  },
  // Only systems with brand variants get an accent menu.
  ...(accents.length
    ? {
        accent: {
          name: 'Accent',
          defaultValue: 'base',
          toolbar: {
            icon: 'paintbrush',
            items: [{ value: 'base', title: 'Base accent' }, ...accents.map((name: string) => ({ value: name, title: name }))],
            dynamicTitle: true,
          },
        },
      }
    : {}),
}

export const decorators: Decorator[] = [WithTheme]

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { theme },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Foundations', ['Introduction', 'Colors', 'Typography', 'Radius', 'Elevation', 'Icons', 'Tokens', 'Source tokens'], 'Components', 'Blocks'],
      },
    },
    // Every story is checked with axe in `npm run test-storybook`; a violation fails the run.
    a11y: {
      test: 'error',
      // Owner decision (2026-10-02): secondary grey on stacked glass matches the
      // reference exactly, below 4.5:1. Only text marked data-contrast-exempt
      // skips the contrast rule; every other rule, and all other text, still runs.
      config: { rules: [{ id: 'color-contrast', selector: '*:not([data-contrast-exempt])' }] },
    },
  },
}

export default preview
