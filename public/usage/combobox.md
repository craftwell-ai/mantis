# combobox (component)

A searchable picker: type to filter a long list, then choose one item, such as a model, a preset or a collaborator.

### When to use
- The list is long enough that scrolling is slow, such as dozens of presets or models.
- People know roughly what they want and can type part of its name.

### Reach for instead
- **select** — when there are fewer than about ten options
- **dropdown-menu** — when the list holds actions, not a value

### Rules
- **Do:** Say what was searched and offer a next step when nothing matches, such as "No presets match 'neon'". **Don't:** Show an empty panel with no message.

### Accessibility
- The input has the combobox role; arrow keys move through results and Enter selects.
- Give the input a label (`aria-label`) naming what is being picked.

### Design tokens
`--field` · `--popover` · `--separator` · `--accent` · `--shadow-popover`

