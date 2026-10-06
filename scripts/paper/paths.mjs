// Shared locations for the Paper board builder.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
// Captures and review screenshots are throwaway; the folder is git-ignored.
export const WORK_DIR = join(REPO, '.paper-build')
export const CAPTURE_DIR = join(WORK_DIR, 'captures')
export const SHOT_DIR = join(WORK_DIR, 'boards')
// Icons are committed: the boards in Paper were built from these files.
export const SVG_DIR = join(REPO, 'design/svg')
export const STORYBOOK_URL = process.env.STORYBOOK_URL || 'https://mantisdesignsystem.com/storybook'
