import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"

// Measured live at 390 / 800 / 1440px widths. Display levels are the
// reference's signature uppercase Space Grotesk headings; md and xl match its
// 768px and 1280px breakpoints. Titles are plain Inter for dialogs and panels.
const headingVariants = cva("text-balance text-foreground", {
  variants: {
    level: {
      hero: "font-grotesk uppercase text-display-md md:text-display-lg xl:text-display-xl",
      section: "font-grotesk uppercase text-display-md md:text-display-lg",
      sub: "font-grotesk uppercase text-display-sm md:text-display-md",
      label: "font-grotesk uppercase text-label-caps",
      title: "text-title-md",
      "title-sm": "text-title-sm",
    },
  },
  defaultVariants: { level: "section" },
})

const defaultTag = { hero: "h1", section: "h2", sub: "h3", label: "h4", title: "h2", "title-sm": "h3" } as const

function Heading({
  className,
  level = "section",
  render,
  ...props
}: useRender.ComponentProps<"h2"> & VariantProps<typeof headingVariants>) {
  return useRender({
    defaultTagName: defaultTag[level ?? "section"],
    props: mergeProps<"h2">({ className: cn(headingVariants({ level }), className) }, props),
    render,
    state: { slot: "heading", level },
  })
}

// One word set in lime, as the reference does in its display headings.
function HeadingAccent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="heading-accent" className={cn("text-brand-text", className)} {...props} />
}

export { Heading, HeadingAccent, headingVariants }
