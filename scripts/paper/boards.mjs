// Which stories go on each Paper board. A story is captured in the state its interaction test
// ENDS in, so pick stories whose end state shows what the label says.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPO, STORYBOOK_URL } from './paths.mjs'

const patternStories = {
  'account-menu': ['open', 'almost-out-of-credits', 'no-picture-no-upsells'],
  'add-media-panel': ['default', 'loading', 'empty-uploads'],
  'agent-approval-card': ['spends-credits', 'changes-data', 'not-enough-credits', 'approved', 'stopped'],
  'announcement-bar': ['default', 'with-countdown', 'not-dismissible'],
  'command-palette': ['open', 'no-results'],
  'compare-slider': ['default', 'starting-off-centre', 'color-change'],
  countdown: ['default', 'compact', 'ended'],
  'empty-state': ['default', 'asset-library', 'no-search-results'],
  'event-map': ['default', 'empty', 'saving-an-event'],
  'feature-grid': ['default', 'four-columns', 'without-links'],
  'feed-post': ['default', 'text-only', 'two-images', 'own-post'],
  'generation-feed': ['default', 'list-view', 'still-generating', 'loading', 'empty'],
  'hello-card': ['default'],
  'how-it-works': ['default', 'without-description'],
  'lightbox-inspector': ['default', 'delete-confirmation'],
  'marketing-hero': ['default', 'single-image', 'text-only'],
  'media-grid': ['default', 'loading', 'end-of-list', 'empty'],
  'model-picker': ['chip', 'open', 'no-results', 'row'],
  'notification-settings': ['default', 'all-off', 'saved', 'save-failed'],
  'notifications-panel': ['open', 'inline', 'all-read', 'empty'],
  'onboarding-steps': ['choice-cards', 'multi-select-grid'],
  'plan-matrix': ['default', 'billed-monthly', 'two-plans'],
  'preset-gallery': ['default', 'loading'],
  'pricing-card': ['creator', 'billed-monthly', 'plan-row'],
  'project-card': ['default', 'without-thumbnail', 'long-name', 'menu-open', 'library'],
  'promo-modal': ['open', 'ended'],
  'prompt-composer': ['empty', 'filled', 'generating', 'not-enough-credits', 'long-prompt'],
  'session-list': ['default', 'only-this-device'],
  'settings-nav': ['default', 'with-footer'],
  'settings-section': ['default', 'with-danger-zone', 'no-icons'],
  'share-dialog': ['open', 'invalid-email', 'public'],
  'site-footer': ['default', 'plain', 'legal-only'],
  'studio-settings-panel': ['empty', 'filled', 'generating', 'not-enough-credits'],
  'top-navigation': ['default', 'signed-out', 'no-sale'],
  'upload-dropzone': ['default', 'uploading', 'turned-away', 'full', 'one-file'],
  'usage-chart': ['bars', 'lines', 'areas', 'one-series'],
  'usage-summary': ['default', 'loading', 'empty'],
  'video-player': ['default', 'with-captions', 'portrait'],
  'workflow-canvas': ['default', 'empty', 'running', 'not-enough-credits'],
}
const templateStories = {
  'app-shell': ['default'],
  'app-shell-sidebar': ['default'],
  'asset-library-page': ['default'],
  'canvas-shell': ['default'],
  'explore-page': ['default'],
  'image-studio-page': ['with-results'],
  'landing-page': ['default'],
  'pricing-page': ['default'],
  'profile-page': ['visitor'],
  'settings-page': ['profile'],
  'studio-home-page': ['with-projects'],
  'video-studio-page': ['with-clips'],
}

const titleCase = (slug) => slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')

// Returns [{ kind, slug, title, pageName, description, stories: [{ id, label }] }].
export async function loadBoards() {
  const index = await (await fetch(`${STORYBOOK_URL}/index.json`)).json()
  const registry = JSON.parse(readFileSync(join(REPO, 'registry.json'), 'utf8'))
  const entries = Object.values(index.entries).filter((entry) => entry.type === 'story')
  const boards = []
  const missing = []
  for (const [kind, prefix, symbol, map] of [
    ['Pattern', 'blocks', '◆', patternStories],
    ['Template', 'templates', '▣', templateStories],
  ]) {
    for (const [slug, keys] of Object.entries(map)) {
      const item = registry.items.find((candidate) => candidate.name === slug)
      if (!item) missing.push(`registry item ${slug}`)
      const stories = []
      for (const key of keys) {
        const id = `${prefix}-${slug}--${key}`
        const entry = entries.find((candidate) => candidate.id === id)
        if (!entry) missing.push(`story ${id}`)
        else stories.push({ id, label: entry.name.toLowerCase() })
      }
      const title = titleCase(slug)
      boards.push({ kind, slug, title, pageName: `${symbol} ${title}`, description: item?.description || '', stories })
    }
  }
  if (missing.length) throw new Error(`Not found in Storybook or the registry: ${missing.join(', ')}`)
  return boards
}
