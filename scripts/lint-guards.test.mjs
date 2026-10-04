// Proves the Mantis guardrails in eslint.config.mjs actually fire. An agent
// writing off-system code (raw colors, stock palette, arbitrary pixels,
// Radix/Lucide habits, stock durations and blurs) must fail `npm run lint`, and the message must tell it
// what to use instead.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESLint } from 'eslint'

const eslint = new ESLint()

const OFF_SYSTEM = `
import { Camera } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
export function Bad() {
  const tone = 'bg-zinc-900'
  return (
    <div className={\`p-[13px] text-white \${tone}\`} style={{ color: '#ff0000' }}>
      <span className="bg-[#d1fe17] [color:var(--mantis-color-lime-500)]" />
      <span className="transition-opacity duration-200 hover:backdrop-blur-md" />
      <Button asChild><a href="/x">Go</a></Button>
      <Button nativeButton={false} render={<a href="/y" />}>Pricing</Button>
      <Camera /><Slot className={cn('a')} />
    </div>
  )
}
`

const ON_SYSTEM = `
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
export function Good() {
  return (
    <div className="w-105 p-4 text-muted-foreground bg-glass border-glass-border transition-opacity duration-(--duration-normal) backdrop-blur-glass">
      <Button variant="brand"><Icon name="add" />Generate</Button>
      <a href="/x" className={buttonVariants({ variant: 'outline' })}>Pricing</a>
    </div>
  )
}
`

const lint = async (code, filePath) => (await eslint.lintText(code, { filePath }))[0].messages

const EXPECTED = [
  ['lucide-react', /Material Symbols/],
  ['@radix-ui', /Base UI/],
  ['stock palette', /stock palette/],
  ['arbitrary pixels', /arbitrary pixel/],
  ['raw color value', /no raw color values/],
  ['arbitrary color', /arbitrary colors/],
  ['source layer', /--mantis-\* is the source layer/],
  ['asChild', /render=\{<Button \/>\}/],
  ['stock cn', /@\/lib\/mantis-cn/],
  ['button as link', /buttonVariants/],
  ['numeric duration', /duration-\(--duration-normal\)/],
  ['stock blur', /backdrop-blur-glass/],
]

// The motion and blur guards cover the primitives and patterns too, not only stories.
const MOTION_GUARDS = EXPECTED.filter(([label]) => label === 'numeric duration' || label === 'stock blur')

test('off-system code in a pattern or story fails every guard', async () => {
  const messages = await lint(OFF_SYSTEM, 'stories/probe.tsx')
  for (const [label, pattern] of EXPECTED) {
    assert.ok(
      messages.some((m) => m.severity === 2 && pattern.test(m.message)),
      `expected the ${label} guard to fire; got:\n${messages.map((m) => m.message).join('\n')}`,
    )
  }
})

test('primitives may use measured pixels but nothing else off-system', async () => {
  const messages = await lint(OFF_SYSTEM, 'components/ui/probe.tsx')
  assert.ok(!messages.some((m) => /arbitrary pixel/.test(m.message)), 'components/ui is exempt from the pixel guard')
  assert.ok(messages.some((m) => /stock palette/.test(m.message)), 'components/ui still fails the color guards')
})

test('numeric durations and stock blurs fail in primitives and patterns', async () => {
  for (const filePath of ['components/ui/probe.tsx', 'registry/probe.tsx']) {
    const messages = await lint(OFF_SYSTEM, filePath)
    for (const [label, pattern] of MOTION_GUARDS) {
      assert.ok(
        messages.some((m) => m.severity === 2 && pattern.test(m.message)),
        `expected the ${label} guard to fire in ${filePath}`,
      )
    }
  }
})

test('on-system code passes', async () => {
  const errors = (await lint(ON_SYSTEM, 'stories/probe.tsx')).filter((m) => m.severity === 2)
  assert.deepEqual(errors.map((m) => m.message), [])
})
