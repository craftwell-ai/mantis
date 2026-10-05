"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const RATIOS = ["1:1", "16:9", "9:16", "4:5"]

function Tile({ name, meta, children }: { name: string; meta: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col rounded-2xl bg-card">
      <div className="flex min-h-45 flex-1 items-center justify-center px-6 py-8">{children}</div>
      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3.5">
        <span className="text-sm font-medium">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">{meta}</span>
      </div>
    </li>
  )
}

/** Six live primitives, each on a stage with its name and one fact about it. */
function ComponentTiles() {
  const [ratio, setRatio] = React.useState("16:9")
  const [isPublic, setIsPublic] = React.useState(true)
  const switchId = React.useId()
  const checkboxId = React.useId()

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,--spacing(90)),1fr))] gap-3">
      <Tile name="Button" meta="12 variants · 13 sizes">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="brand" depth="raised">
            Sign up
          </Button>
          <Button>Save</Button>
          <Button variant="glass">Share</Button>
          <Button variant="ghost" size="icon" aria-label="More">
            <Icon name="more_vert" />
          </Button>
        </div>
      </Tile>
      <Tile name="Badge" meta="9 variants">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="new">New</Badge>
          <Badge variant="neutral">Beta</Badge>
          <Badge variant="sale">−40%</Badge>
          <Badge variant="value">Best value</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>
      </Tile>
      <Tile name="Toggle group" meta="3 styles">
        <ToggleGroup
          aria-label="Aspect ratio"
          value={[ratio]}
          // Keep one ratio chosen: pressing the active one again changes nothing.
          onValueChange={(next) => next[0] && setRatio(next[0])}
        >
          {RATIOS.map((value) => (
            <ToggleGroupItem key={value} value={value}>
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Tile>
      <Tile name="Switch · Checkbox" meta="Lime means on">
        <div className="flex w-full max-w-90 flex-col gap-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={switchId}>Public project</label>
            <Switch id={switchId} checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={checkboxId}>Sound on clips</label>
            <Checkbox id={checkboxId} defaultChecked />
          </div>
        </div>
      </Tile>
      <Tile name="Progress" meta="Shows real numbers">
        <div className="flex w-full max-w-90 flex-col gap-3">
          <Progress value={64} className="justify-between text-sm">
            <ProgressLabel>Credits this month</ProgressLabel>
            <ProgressValue>{() => "640 of 1,000"}</ProgressValue>
          </Progress>
          <p className="text-sm text-muted-foreground">Resets on November 1</p>
        </div>
      </Tile>
      <Tile name="Icon tile" meta="6 palette pairs">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <IconTile name="image" color="blue" size="lg" />
          <IconTile name="movie" color="purple" size="lg" />
          <IconTile name="brush" color="pink" size="lg" />
          <IconTile name="music_note" color="orange" size="lg" />
          <IconTile name="view_in_ar" color="mint" size="lg" />
          <IconTile name="folder" color="brown" size="lg" />
        </div>
      </Tile>
    </ul>
  )
}

export { ComponentTiles }
