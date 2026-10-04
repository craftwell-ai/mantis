import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usage } from '../usage/table.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

type RenderStatus = 'Ready' | 'Rendering' | 'Failed'

const RECENT_GENERATIONS: { id: string; title: string; preset: string; status: RenderStatus; credits: number }[] = [
  { id: 'g-4107', title: 'Glass Harbor', preset: 'Neon Drift', status: 'Ready', credits: 4 },
  { id: 'g-4106', title: 'Night Market Teaser', preset: 'Neon Drift', status: 'Rendering', credits: 120 },
  { id: 'g-4105', title: 'Lantern Alley', preset: 'Soft Dusk', status: 'Ready', credits: 8 },
  { id: 'g-4104', title: 'Rooftop Chase', preset: 'Hand-held 35', status: 'Failed', credits: 0 },
  { id: 'g-4103', title: 'Paper Moon', preset: 'Soft Dusk', status: 'Ready', credits: 16 },
]

const STATUS_ICON: Record<RenderStatus, IconName> = { Ready: 'check_circle', Rendering: 'progress_activity', Failed: 'error' }

const credits = new Intl.NumberFormat('en-US')

function StatusLabel({ status }: { status: RenderStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={STATUS_ICON[status]} />
      {status}
    </span>
  )
}

function GenerationsTable({ caption }: { caption?: string }) {
  const total = RECENT_GENERATIONS.reduce((sum, generation) => sum + generation.credits, 0)
  return (
    <div className="w-full max-w-2xl">
      <Table>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow>
            <TableHead>Generation</TableHead>
            <TableHead>Preset</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Credits</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {RECENT_GENERATIONS.map((generation) => (
            <TableRow key={generation.id}>
              <TableCell className="font-medium">{generation.title}</TableCell>
              <TableCell>{generation.preset}</TableCell>
              <TableCell>
                <StatusLabel status={generation.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{credits.format(generation.credits)}</TableCell>
              <TableCell className="text-right">
                {/* A focusable control in every row also lets keyboard users
                    scroll the table sideways on a narrow screen. */}
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${generation.title}`}>
                  <Icon name="more_vert" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {caption ? (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total credits</TableCell>
              <TableCell className="text-right tabular-nums">{credits.format(total)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  )
}

const meta = {
  title: 'Components / Table',
  component: Table,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <GenerationsTable /> }

export const WithCaption: Story = { render: () => <GenerationsTable caption="Generations from the last 7 days" /> }

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <GenerationsTable />,
}

const CREDITS_BY_PROJECT = [
  { project: 'Night Market Teaser', used: 1840 },
  { project: 'Glass Harbor', used: 120 },
  { project: 'Paper Lantern Shorts', used: 16 },
]

function AmountsTable({ align }: { align: 'right' | 'left' }) {
  const alignment = align === 'right' ? 'text-right tabular-nums' : 'text-left'
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead className={alignment}>Credits used</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {CREDITS_BY_PROJECT.map((row) => (
          <TableRow key={row.project}>
            <TableCell>{row.project}</TableCell>
            <TableCell className={alignment}>{credits.format(row.used)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const DOT_COLOR: Record<RenderStatus, string> = { Ready: 'bg-primary', Rendering: 'bg-muted-foreground', Failed: 'bg-destructive' }

function StatusTable({ asDots }: { asDots?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Generation</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RECENT_GENERATIONS.slice(1, 4).map((generation) => (
          <TableRow key={generation.id}>
            <TableCell>{generation.title}</TableCell>
            <TableCell>
              {asDots ? (
                // The dot keeps an accessible name so the example itself passes
                // the axe check; the problem this pair shows is the visual one.
                <span role="img" aria-label={generation.status} className={`inline-block size-2.5 rounded-full ${DOT_COLOR[generation.status]}`} />
              ) : (
                <StatusLabel status={generation.status} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="align-numbers-right" doExample={<AmountsTable align="right" />} dontExample={<AmountsTable align="left" />} />
      <DoDontPair usage={usage} id="status-in-words" doExample={<StatusTable />} dontExample={<StatusTable asDots />} />
    </div>
  ),
}
