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

// Mantis's opacities (opacity-disabled…) are names, not Tailwind's numbers, so stock cn keeps
// a numeric opacity beside one instead of replacing it. The list must match tokens.opacity.
export const OPACITIES = ["disabled", "muted", "scrim"]

// Mantis's layers (z-raised, z-sticky, z-floating) are names, not Tailwind's integers, so stock cn
// keeps a numeric layer beside one instead of replacing it. The list must match tokens.layer.
export const LAYERS = ["raised", "sticky", "floating"]

// Mantis's motion names (duration-normal, ease-swift…) are not Tailwind's, so stock cn keeps both
// classes in cn("ease-out", "ease-swift"). The lists must match tokens.motion.
export const DURATIONS = ["fast", "quick", "normal", "slow"]
export const EASES = ["in", "out", "in-out", "swift", "emphasized", "spring", "out-expo"]

// Mantis's blurs (blur-glass, backdrop-blur-dialog…) are names Tailwind does not have. The list must match tokens.blur.
export const BLURS = ["chip", "glass", "dialog"]

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
      opacity: [{ opacity: OPACITIES }],
      z: [{ z: LAYERS }],
      duration: [{ duration: DURATIONS }],
      ease: [{ ease: EASES }],
      blur: [{ blur: BLURS }],
      "backdrop-blur": [{ "backdrop-blur": BLURS }],
    },
  },
})
