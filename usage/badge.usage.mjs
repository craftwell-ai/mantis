export const usage = {
  name: 'badge',
  kind: 'component',
  summary: 'A short label that marks something as new, discounted, featured or counted, set beside the thing it describes.',
  useWhen: [
    'A model, preset or nav item is new and should stand out for a while (`new`), or a plan or allowance needs a lime highlight, such as "Unlimited" or "3 free generations" (`new`, `tag`).',
    'A plan or credit pack is on sale, or one tier is the best value (`sale`, `value`, `hot`).',
    'A small count or tier sits next to a label, such as a version or a plan name (`neutral`, `tag`).',
  ],
  alternatives: [
    { name: 'button', when: 'the label does something when pressed; a badge is never interactive on its own' },
    { name: 'sonner', when: 'the information is a one-off status message rather than a lasting label' },
  ],
  rules: [
    {
      id: 'one-badge-per-item',
      do: 'Give an item at most one badge, choosing the one that matters most right now, such as New on a just-released preset.',
      dont: 'Stack New, Hot and a discount on the same card. Several badges compete and none of them reads as special.',
      visual: true,
    },
    {
      id: 'commerce-badges-for-commerce',
      do: 'Keep the pink and blue `sale`, `hot` and `value` badges for discounts and offers, and use the lime `new` or `tag` badge for New and for plan or allowance highlights such as "Unlimited".',
      dont: 'Use the pink or blue commerce badges to decorate ordinary features. They signal money and urgency.',
      visual: true,
    },
    {
      id: 'short-labels',
      do: 'Keep badge text to one or two short words or a number, such as "New" or "30% off".',
      dont: 'Write a sentence in a badge. It will truncate, and small type is hard to read at length.',
      visual: false,
    },
  ],
  a11y: [
    'A badge is plain text, so screen readers read it in place; make sure it still makes sense read aloud next to its item.',
    'Do not rely on the badge color alone to carry meaning: the word itself must say it.',
    'Every filled badge meets WCAG 2.1 AA (4.5:1). Commerce colors that failed on the reference use the approved nearest passing shades.',
  ],
  tokens: ['--badge-new', '--badge-new-foreground', '--badge-neutral', '--badge-neutral-foreground', '--brand', '--primary-foreground', '--sale', '--sale-foreground', '--badge-hot', '--badge-value', '--text-gold'],
}
