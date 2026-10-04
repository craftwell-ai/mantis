# input-group (component)

An input with icons or buttons inside its frame, such as a search field with a leading magnifier or a link field with a Copy button.

### When to use
- An input needs a leading icon, such as search.
- An action belongs inside the field, such as Copy beside a share link.

### Reach for instead
- **input** — when the field needs nothing inside it

### Rules
- **Do:** Put at most one action inside the field, such as Copy. **Don't:** Crowd several buttons into the field; move them outside it.

### Accessibility
- Inline buttons need their own accessible names, such as "Copy link".
- Matches Input: no resting border (owner decision), lime ring on focus.

### Design tokens
`--field` · `--ring`

