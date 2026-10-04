import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Pagination } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usage } from '../usage/pagination.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Pagination',
  component: Pagination,
  args: { page: 2, pageCount: 7, onPageChange: () => {}, 'aria-label': 'Render queue pages' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

// The width of a narrow table.
const tableWidth: Story['decorators'] = [(Story) => <div className="w-120"><Story /></div>]

export const Default: Story = { decorators: tableWidth }

export const WithRowsPicker: Story = {
  decorators: tableWidth,
  name: 'With rows per page',
  args: { pageSize: 25, onPageSizeChange: () => {} },
}

const jobs = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: ['Harbor at dusk', 'Desert tram', 'Neon alley', 'Glacier flyover', 'Orchard portrait'][index % 5],
  credits: 4 + ((index * 7) % 30),
}))

function PagedTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const pageCount = Math.ceil(jobs.length / pageSize)
  const rows = jobs.slice((page - 1) * pageSize, page * pageSize)
  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Render</TableHead>
            <TableHead className="text-right">Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                #{job.id} {job.name}
              </TableCell>
              <TableCell className="text-right tabular-nums">{job.credits}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        aria-label="Render history pages"
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizes={[5, 10, 25]}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}

export const UnderATable: Story = {
  decorators: tableWidth,
  name: 'Under a table',
  render: () => <PagedTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Render history pages' })).toBeInTheDocument()
    await expect(canvas.getByText('Page 1 of 5')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(canvas.getByText('Page 2 of 5')).toBeInTheDocument()
    await expect(canvas.getByText('#6 Harbor at dusk')).toBeInTheDocument()
  },
}

export const LastPage: Story = {
  decorators: tableWidth,
  name: 'On the last page',
  args: { page: 7 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Next page' })).toBeDisabled()
  },
}

export const DoDont: Story = {
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="say-where-you-are"
        doExample={<Pagination aria-label="Example pages" page={2} pageCount={7} onPageChange={() => {}} />}
        dontExample={
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Previous page">
              <Icon name="chevron_left" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Next page">
              <Icon name="chevron_right" />
            </Button>
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="under-the-table"
        doExample={
          <div className="flex flex-col gap-2">
            <div className="h-24 rounded-lg bg-field" role="img" aria-label="Placeholder for a table" />
            <Pagination aria-label="Table pages" page={1} pageCount={3} onPageChange={() => {}} />
          </div>
        }
        dontExample={
          <div className="flex flex-col gap-8">
            <Pagination aria-label="Top pages" page={1} pageCount={3} onPageChange={() => {}} />
            <div className="h-10 rounded-lg bg-field" role="img" aria-label="Placeholder for a short table" />
            <Pagination aria-label="Bottom pages" page={1} pageCount={3} onPageChange={() => {}} />
          </div>
        }
      />
    </div>
  ),
}
