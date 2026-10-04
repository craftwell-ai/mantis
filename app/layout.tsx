import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// The className on <html> is what actually applies the font: @theme inline
// cannot resolve next/font's runtime variables (see CLAUDE.md, font gotcha).
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mantis Design System",
  description: "The Mantis component registry: tokens, components and patterns for AI-native creative tools.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Mantis ships one theme, and it is dark, so data-theme is always "dark".
  return (
    <html lang="en" data-theme="dark" className={inter.className}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
