"use client"

import { AssetLibraryPage } from "@/registry/asset-library-page"
import { LandingPage } from "@/registry/landing-page"
import { PricingPage } from "@/registry/pricing-page"
import { ProfilePage } from "@/registry/profile-page"
import { SettingsPage } from "@/registry/settings-page"

const PAGES = {
  "landing-page": LandingPage,
  "profile-page": ProfilePage,
  "asset-library-page": AssetLibraryPage,
  "pricing-page": PricingPage,
  "settings-page": SettingsPage,
}

/** One page template with its sample content, for the home page gallery. */
function PagePreview({ slug }: { slug: keyof typeof PAGES }) {
  const Page = PAGES[slug]
  return <Page />
}

export { PagePreview }
