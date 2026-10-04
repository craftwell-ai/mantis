# select (component)

A composer-style chip that opens a menu to pick one value, such as the aspect ratio or quality of a generation.

### When to use
- A setting has more options than fit inline, such as aspect ratio, quality or style.
- The current value should stay visible on the chip, such as "Auto" or "2K".

### Reach for instead
- **toggle-group** — when there are only two to five short options and room to show them all
- **dropdown-menu** — when the list holds actions, not a value

### Rules
- **Do:** Show the chosen value on the chip, with an icon when it helps, such as "2K". **Don't:** Label the chip with the setting name only, so people must open it to see the value.
- **Do:** Order options by size or frequency, such as aspect ratios from wide to tall. **Don't:** Order options randomly or by internal ID.

### Accessibility
- The chip is a combobox: Enter, Space or the arrow keys open it, and typing jumps to an option.
- Give the select a label (`aria-label`) naming the setting, since the chip shows only the value.

### Design tokens
`--chip` · `--chip-foreground` · `--chip-border` · `--popover` · `--accent` · `--separator` · `--divider` · `--shadow-popover`

