# promo-modal (block)

An upsell dialog: a media header with a sale tag, an uppercase headline, a short benefit list, a price tile beside a countdown to the deadline, the lime claim button and a quiet "Maybe later".

### When to use
- A time-limited discount on a paid plan should be offered once, at a natural pause, such as after a first finished generation or when credits run low.
- The offer has a real deadline and a real price, and both belong on screen together.

### Reach for instead
- **pricing-card** — when people are comparing plans on a pricing page rather than reacting to one offer
- **sonner** — when the news is small, such as a new feature, and needs no decision

### Rules
- **Do:** Claim the offer with the lime `brand` button, the dialog's one lime action, and mark the discount with the pink sale badge. **Don't:** Buy with the commerce-pink button. Pink marks the discount itself; the action that buys is lime, as it is on the pricing page.
- **Do:** Offer a close button and a plain "Maybe later"; Esc and clicking outside close it too. **Don't:** Hide the way out, or word it to shame people ("No, I like paying more").
- **Do:** Count down to the real end of the offer and lock the button when it passes. **Don't:** Restart the timer on every visit or invent urgency the offer does not have.
- **Do:** Show the discounted price, the struck regular price, how long the discount lasts and the renewal price in the small print. **Don't:** Show only the percentage, leaving people to guess what they will pay.

### Accessibility
- The dialog is named by its headline and described by the line under it; focus starts inside it and returns to the trigger on close.
- The countdown is a timer with a spoken label in hours and minutes; its per-second digits are hidden so screen readers are not interrupted every second.
- The struck price is announced as "Regular price"; the media header carries real alt text.
- When the offer ends the button stays focusable but disabled and reads "This offer has ended".

### Design tokens
`--dialog` · `--card` · `--brand` · `--brand-foreground` · `--sale` · `--sale-foreground` · `--glass` · `--muted-foreground` · `--foreground` · `--ring`

