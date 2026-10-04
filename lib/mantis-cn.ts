import { createCn } from "cn/config"

// Mantis's composite text styles (text-display-lg, text-title-sm…) are not
// Tailwind sizes, so stock cn reads them as text colors and silently drops
// one when a color follows: cn("text-display-lg text-muted-foreground") loses
// the size. Registering them as font sizes keeps both. The list must match
// tokens.textStyles; scripts/mantis-cn.test.mjs checks that it does.
export const TEXT_STYLES = ["display-sm", "display-md", "display-lg", "display-xl", "label-caps", "title-sm", "title-md"]

export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: TEXT_STYLES }] } },
})
