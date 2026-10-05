import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { SITE_URL } from "@/lib/site"

// The className on <html> is what actually applies the font: @theme inline
// cannot resolve next/font's runtime variables (see CLAUDE.md, font gotcha).
const inter = Inter({ subsets: ["latin"] })

const title = "Mantis Design System"
const description =
  "A futuristic design system for AI-powered creative tools and studios: tokens, components, blocks and page templates you install with one command, for people and coding agents."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: title, title, description },
  twitter: { card: "summary", title, description },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Mantis ships one theme, and it is dark, so data-theme is always "dark".
  return (
    <html lang="en" data-theme="dark" className={inter.className}>
      <head>
        {/* The display and mono faces are named by family in the tokens, so they load from the
            stylesheet (as in Storybook) rather than through next/font, which renames families. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this is the root layout, so the fonts load on every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
