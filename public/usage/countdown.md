# countdown (block)

An offer timer: a label such as "Launch pricing ends in" above hours, minutes and seconds shown as glass tiles, counting down to a fixed time and switching to an ended message at zero.

### When to use
- A discount, launch price or limited plan really ends at a known time, and showing the time left helps people decide.
- A pricing page or upgrade panel needs the boxed timer beside a promotion, or an announcement bar needs the compact `sm` row.

### Reach for instead
- **badge** — when the offer has no hard deadline; a "30% off" sale badge says enough without a clock
- **progress** — when you are showing how much of something is used, not how long is left

### Rules
- **Do:** Pass the offer's actual end time, and let the timer show the ended message when it passes. **Don't:** Restart the timer on every visit to create false urgency. People notice, and it breaks trust in every other price on the page.
- **Do:** Show one timer per page, next to the offer it belongs to. **Don't:** Repeat the timer on every plan card or stack two timers for different offers; the ticking pulls the eye away from the prices.
- **Do:** Name what is ending in the label, such as "Launch pricing ends in". **Don't:** Use a bare "Hurry!" or no label at all; a clock without a subject does not tell people what they would miss.

### Accessibility
- The timer has `role="timer"`, labelled by its visible label, so it is not announced every second.
- The tiles are hidden from screen readers; a visually hidden sentence ("2 hours, 14 minutes and 5 seconds") carries the time for anyone who reads the timer.
- Reaching zero is announced once through a polite status message.
- The pink hourglass is decorative; the label text uses the off-white foreground because pink text is below 4.5:1 on the page.

### Design tokens
`--glass` · `--secondary` · `--glass-border` · `--foreground` · `--muted-foreground` · `--sale`

