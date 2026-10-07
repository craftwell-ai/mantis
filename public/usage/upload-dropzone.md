# upload-dropzone (block)

A drop area for adding files: drag them in, paste them or browse, with a list of what was added and a plain reason when a file is turned away.

### When to use
- People bring their own files into the product, such as reference images, source clips or a brand kit.
- A form or dialog needs one or several attachments, with limits on type, size or count.

### Reach for instead
- **add-media-panel** — when people also pick from things already in their library, not only from their computer
- **button** — when one file, no preview needed: a plain Upload button that opens the file picker is enough
- **empty-state** — when the page is empty and uploading is only one of several ways to start

### Rules
- **Do:** State the accepted types and the size limit in the hint, such as "PNG, JPG or WebP, up to 20 MB each". **Don't:** Let people find the limits out by being turned away.
- **Do:** When some files in a drop are fine and some are not, add the good ones and name each one that was left out, with the reason. **Don't:** Reject the whole drop, or show a generic "Upload failed".
- **Do:** Pass `progress` while files are being sent, so each row shows how far along it is. **Don't:** Leave a large file sitting in the list with no sign that anything is happening.

### Accessibility
- The Browse files button opens the file picker from the keyboard; the drop area is a mouse and touch shortcut, not a second tab stop.
- Files turned away are announced through a live alert, each named with its reason.
- Every Remove button names its file, and each progress bar is labelled with the file it belongs to.

### Design tokens
`--glass` · `--glass-border` · `--brand` · `--destructive` · `--muted-foreground` · `--foreground` · `--secondary`

