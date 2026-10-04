import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Mantis guardrails. Agents copy what they see more than they follow written
// rules, so off-system code has to fail the build, not just the review.
// Each message says what to use instead, because an agent reads it as a fix.
const TAILWIND_PALETTE =
  "(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
const COLOR_UTILITY = "(bg|text|border|ring|fill|stroke|from|to|via|outline|divide|placeholder|decoration|caret|shadow)";

// Applied to both plain strings and template-literal chunks.
const stringRules = (pattern, message) => [
  { selector: `Literal[value=${pattern}]`, message },
  { selector: `TemplateElement[value.raw=${pattern}]`, message },
];

const systemRules = [
  ...stringRules(
    "/\\[(#|rgba?\\(|hsla?\\(|oklch\\()/",
    "Mantis: no arbitrary colors like bg-[#fff]. Use a token utility (bg-background, text-muted-foreground, bg-brand…); see AGENTS.md › Tokens.",
  ),
  ...stringRules(
    "/^\\s*(#[0-9a-fA-F]{3,8}|rgba?\\(.*\\))\\s*$/",
    "Mantis: no raw color values. Use a token utility in className, or var(--token) if a style prop is unavoidable.",
  ),
  ...stringRules(
    `/(^|[\\s:])${COLOR_UTILITY}-(${TAILWIND_PALETTE}-[0-9]{2,3}|white|black)(\\/|\\s|$)/`,
    "Mantis: Tailwind's stock palette is off-system. Use a token utility (text-foreground, bg-glass, border-glass-border…); see AGENTS.md › Tokens.",
  ),
  ...stringRules(
    "/(^|[\\s:])duration-[0-9]+(\\s|$)/",
    "Mantis: no numeric durations like duration-200. Use a motion token: duration-(--duration-fast) 100ms, duration-(--duration-quick) 150ms, duration-(--duration-normal) 200ms, duration-(--duration-slow) 300ms.",
  ),
  ...stringRules(
    "/(^|[\\s:])backdrop-blur-(sm|md|lg|xl|2xl|3xl)(\\s|$)/",
    "Mantis: no stock blur sizes like backdrop-blur-md. Use a measured blur token: backdrop-blur-chip (8px), backdrop-blur-glass (12px), backdrop-blur-dialog (32px).",
  ),
  ...stringRules(
    "/--mantis-/",
    "Mantis: --mantis-* is the source layer. Read a semantic token or shadcn alias instead; if none fits, add one in tokens/mantis.tokens.mjs.",
  ),
  {
    selector: "JSXOpeningElement[name.name='Button'] > JSXAttribute[name.name='nativeButton']",
    message: "Mantis: a link that looks like a button is <a className={buttonVariants({…})}>; Button with render={<a>} is announced as a button.",
  },
  {
    selector: "JSXAttribute[name.name='asChild']",
    message: "Mantis is built on Base UI: compose with render={<Button />}, not asChild.",
  },
];

const noArbitraryPx = stringRules(
  "/-\\[-?[0-9.]+px\\]/",
  "Mantis: no arbitrary pixel values like w-[13px]. Use the spacing scale (w-105 = 420px) or a component size prop.",
);

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "public/**", "storybook-static/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...systemRules, ...noArbitraryPx],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "lucide-react", message: "Mantis icons are Material Symbols: import { Icon } from '@/components/ui/icon'." },
            { name: "cn", importNames: ["cn"], message: "Import cn from '@/lib/mantis-cn': stock cn drops Mantis text styles (text-display-lg) when a color follows." },
          ],
          patterns: [{ group: ["@radix-ui/*"], message: "Mantis is built on Base UI (@base-ui/react), not Radix." }],
        },
      ],
    },
  },
  {
    // The primitives hold the reference's measured values (a 5px badge
    // radius, 0.1px tracking), so only they may use exact pixels.
    files: ["components/ui/**/*.tsx", "registry/**/*.tsx"],
    rules: { "no-restricted-syntax": ["error", ...systemRules] },
  },
  {
    // Stories show Picsum placeholders in plain <img>; next/image optimization
    // is an app concern, not a documentation one.
    files: ["stories/**/*.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default eslintConfig;
