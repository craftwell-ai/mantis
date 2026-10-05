import { readdirSync } from "node:fs"
import { join } from "node:path"

import { icons } from "@/components/ui/icons.generated"
import packageJson from "@/package.json"
import registry from "@/registry.json"

import { PAGE_TEMPLATES } from "./site"

// Counted from the repo when the page is built, so the home page never drifts from what ships.
export function siteStats() {
  const templates = new Set<string>(PAGE_TEMPLATES)
  const blocks = registry.items.filter((item) => item.type === "registry:block")
  return {
    components: readdirSync(join(process.cwd(), "components/ui")).filter((file) => file.endsWith(".tsx")).length,
    blocks: blocks.filter((item) => !templates.has(item.name)).length,
    pages: blocks.filter((item) => templates.has(item.name)).length,
    icons: Object.keys(icons).length,
    version: packageJson.version,
  }
}
