import type { SVGAttributes } from 'react'

import { cn } from '@/lib/mantis-cn'

import { icons, type IconName } from './icons.generated'

// Google Material Symbols (Rounded, weight 300), drawn inline from path data
// that scripts/build-icons.mjs generates into ./icons.generated.ts. Only the
// names in scripts/icons.manifest.mjs ship, and `IconName` is their union, so an
// unknown name fails the typecheck instead of rendering an empty box. Sizes to
// 1em and paints in currentColor, so it matches the text around it. Decorative
// by default; pass `label` when the icon is a control's only content.
export type { IconName }

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  name: IconName
  label?: string
}

function Icon({ name, label, className, ...props }: IconProps) {
  const data = icons[name]
  if (!data) {
    throw new Error(
      `Icon: '${String(name)}' is not one of this design system's icons — add it to scripts/icons.manifest.mjs in the registry repo and run node scripts/build-icons.mjs`,
    )
  }
  return (
    <svg
      data-slot="icon"
      viewBox={data.viewBox}
      width="1em"
      height="1em"
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      // Merged, not joined: a caller's `hidden` must beat the default inline-block.
      className={cn('inline-block shrink-0', className)}
      {...props}
    >
      {data.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export { Icon }
