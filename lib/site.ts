// The one place the site's address and its fixed links live.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mantisdesignsystem.com"

export const links = {
  storybook: "/storybook/",
  llms: "/llms.txt",
  design: "/design.md",
  usage: (name: string) => `/usage/${name}.md`,
}

// Registry blocks that are whole pages; every other block counts as a pattern.
export const PAGE_TEMPLATES = [
  "explore-page",
  "profile-page",
  "pricing-page",
  "landing-page",
  "image-studio-page",
  "video-studio-page",
  "studio-home-page",
  "asset-library-page",
  "app-shell",
  "app-shell-sidebar",
  "settings-page",
  "canvas-shell",
] as const
