import { createCn } from "cn/config"

// Mantis's composite text styles (text-display-lg, text-title-sm…) are not
// Tailwind sizes, so stock cn reads them as text colors and silently drops
// one when a color follows: cn("text-display-lg text-muted-foreground") loses
// the size. Registering them as font sizes keeps both. The list must match
// tokens.textStyles; scripts/mantis-cn.test.mjs checks that it does.
export const TEXT_STYLES = ["display-sm", "display-md", "display-lg", "display-xl", "label-caps", "title-sm", "title-md"]

// Mantis's size tokens (h-control, size-icon-md…) are not Tailwind steps either,
// so stock cn does not see them as widths or heights and keeps both classes:
// cn("h-control", "h-control-xs") leaves the stylesheet to pick one. Registering
// them makes a size passed in replace the component's own. The list must match
// tokens.size; scripts/mantis-cn.test.mjs checks that it does.
export const SIZES = ["icon-3xs", "icon-2xs", "icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl", "icon-2xl", "icon-3xl", "control-2xs", "control-xs", "control-sm", "control", "control-lg", "control-xl", "control-cta", "control-2xl", "control-3xl", "tap"]

export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: TEXT_STYLES }],
      w: [{ w: SIZES }],
      h: [{ h: SIZES }],
      size: [{ size: SIZES }],
      "min-w": [{ "min-w": SIZES }],
      "min-h": [{ "min-h": SIZES }],
      "max-h": [{ "max-h": SIZES }],
    },
  },
})
