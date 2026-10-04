export const usage = {
  name: 'select',
  kind: 'component',
  summary: 'A composer-style chip that opens a menu to pick one value, such as the aspect ratio or quality of a generation.',
  useWhen: [
    'A setting has more options than fit inline, such as aspect ratio, quality or style.',
    'The current value should stay visible on the chip, such as "Auto" or "2K".',
  ],
  alternatives: [
    { name: 'toggle-group', when: 'there are only two to five short options and room to show them all' },
    { name: 'dropdown-menu', when: 'the list holds actions, not a value' },
  ],
  rules: [
    {
      id: 'show-current-value',
      do: 'Show the chosen value on the chip, with an icon when it helps, such as "2K".',
      dont: 'Label the chip with the setting name only, so people must open it to see the value.',
      visual: true,
    },
    {
      id: 'order-options-predictably',
      do: 'Order options by size or frequency, such as aspect ratios from wide to tall.',
      dont: 'Order options randomly or by internal ID.',
      visual: false,
    },
  ],
  a11y: [
    'The chip is a combobox: Enter, Space or the arrow keys open it, and typing jumps to an option.',
    'Give the select a label (`aria-label`) naming the setting, since the chip shows only the value.',
  ],
  tokens: ['--chip', '--chip-foreground', '--chip-border', '--popover', '--accent', '--separator', '--divider', '--shadow-popover'],
}
