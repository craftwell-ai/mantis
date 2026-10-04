# avatar (component)

A round picture or initials that stands for a person, such as the account button, a post author or a collaborator.

### When to use
- A person is shown beside their content, such as a post author or a project owner.
- Several collaborators share a project (`AvatarGroup`).

### Reach for instead
- **badge** — when the item is a label, not a person

### Rules
- **Do:** Give every avatar initials as a fallback, so a missing photo still identifies the person. **Don't:** Leave an empty grey circle when the photo fails to load.
- **Do:** Show the person's name next to the avatar the first time they appear. **Don't:** Rely on a face alone to identify someone.

### Accessibility
- Give the image `alt` text with the person's name; leave it empty when the name is printed beside it.
- Initials are white on the inset grey, which meets 4.5:1.

### Design tokens
`--secondary` · `--foreground`

