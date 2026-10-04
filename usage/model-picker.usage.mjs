export const usage = {
  name: 'model-picker',
  kind: 'block',
  summary: 'A searchable list of AI models that opens from a composer chip: Featured and All groups, each row an icon tile, the model name, a one-line description and an optional New or Hot badge, with a check on the model in use.',
  useWhen: [
    'People choose which model runs a generation and need a sentence on each one to decide, such as in a prompt composer or a studio settings rail.',
    'There are more than about six models, so a plain chip menu gets long and people want to type to find one.',
  ],
  alternatives: [
    { name: 'select', when: 'there are only a few models and their names say enough on their own, as in the prompt composer\'s model chip' },
    { name: 'combobox', when: 'you need a generic searchable list, not the model rows with tiles and descriptions' },
  ],
  rules: [
    {
      id: 'describe-what-it-is-for',
      do: 'Write each description as what the model is good at, such as "Smooth camera moves up to 10 seconds".',
      dont: 'Repeat the model name, a version number or marketing words like "Our best model yet", which do not help anyone choose.',
      visual: true,
    },
    {
      id: 'feature-a-few',
      do: 'Feature three to five models people should try first; everything else goes under All models.',
      dont: 'Mark most models as featured. A Featured group as long as the full list stops pointing anywhere.',
      visual: false,
    },
    {
      id: 'one-badge-per-row',
      do: 'Give a row at most one badge: New for a recent release, or Hot for one many people use right now.',
      dont: 'Stack New and Hot on the same row, or badge every row so none stands out.',
      visual: true,
    },
  ],
  a11y: [
    'The trigger is a combobox named by `label` ("Model"); its text is read as the current value.',
    'The search field has its own name ("Search models") and filters by name and description as you type.',
    'Group headings (Featured, All models) are announced as you move between groups.',
    'The selected row carries a check icon and a fill, so the choice is not shown by color alone.',
    'The Hot badge uses the neutral badge, not the pink commerce gradient, because a model is not an offer.',
  ],
  tokens: ['--chip', '--chip-border', '--chip-foreground', '--field', '--popover', '--glass', '--secondary', '--muted-foreground', '--badge-new', '--badge-neutral', '--ring'],
}
