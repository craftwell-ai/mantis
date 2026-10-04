export const usage = {
  name: 'promo-modal',
  kind: 'block',
  summary: 'An upsell dialog: a media header with a sale tag, an uppercase headline, a short benefit list, a price tile beside a countdown to the deadline, the lime claim button and a quiet "Maybe later".',
  useWhen: [
    'A time-limited discount on a paid plan should be offered once, at a natural pause, such as after a first finished generation or when credits run low.',
    'The offer has a real deadline and a real price, and both belong on screen together.',
  ],
  alternatives: [
    { name: 'pricing-card', when: 'people are comparing plans on a pricing page rather than reacting to one offer' },
    { name: 'sonner', when: 'the news is small, such as a new feature, and needs no decision' },
  ],
  rules: [
    {
      id: 'lime-to-claim-pink-for-the-sale',
      do: 'Claim the offer with the lime `brand` button, the dialog\'s one lime action, and mark the discount with the pink sale badge.',
      dont: 'Buy with the commerce-pink button. Pink marks the discount itself; the action that buys is lime, as it is on the pricing page.',
      visual: true,
    },
    {
      id: 'easy-to-leave',
      do: 'Offer a close button and a plain "Maybe later"; Esc and clicking outside close it too.',
      dont: 'Hide the way out, or word it to shame people ("No, I like paying more").',
      visual: false,
    },
    {
      id: 'honest-deadline',
      do: 'Count down to the real end of the offer and lock the button when it passes.',
      dont: 'Restart the timer on every visit or invent urgency the offer does not have.',
      visual: false,
    },
    {
      id: 'price-in-full',
      do: 'Show the discounted price, the struck regular price, how long the discount lasts and the renewal price in the small print.',
      dont: 'Show only the percentage, leaving people to guess what they will pay.',
      visual: false,
    },
  ],
  a11y: [
    'The dialog is named by its headline and described by the line under it; focus starts inside it and returns to the trigger on close.',
    'The countdown is a timer with a spoken label in hours and minutes; its per-second digits are hidden so screen readers are not interrupted every second.',
    'The struck price is announced as "Regular price"; the media header carries real alt text.',
    'When the offer ends the button stays focusable but disabled and reads "This offer has ended".',
  ],
  tokens: ['--dialog', '--card', '--brand', '--brand-foreground', '--sale', '--sale-foreground', '--glass', '--muted-foreground', '--foreground', '--ring'],
}
