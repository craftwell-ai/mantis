export const usage = {
  name: 'announcement-bar',
  kind: 'block',
  summary: 'A full-width lime bar above the top navigation that carries one short message, one call-to-action link and a close button.',
  useWhen: [
    'Something new or time-limited affects most visitors, such as a new video model, a launch discount or planned downtime, and it deserves a line above the whole site.',
    'People should be able to act on the message in one click and dismiss it once they have seen it.',
  ],
  alternatives: [
    { name: 'sonner', when: 'the message confirms something the person just did; a toast reports it without taking a row of the page' },
    { name: 'dialog', when: 'people must read or decide something before they continue' },
    { name: 'countdown', when: 'the deadline is the message; put the compact countdown in the bar\'s `aside` slot rather than writing the time in words' },
  ],
  rules: [
    {
      id: 'one-bar-at-a-time',
      do: 'Show one announcement bar at a time, at the very top of the page.',
      dont: 'Stack two lime bars. The second one halves the attention the first one gets, and together they push the product below the fold.',
      visual: true,
    },
    {
      id: 'one-line-message',
      do: 'Write one short sentence and a verb-led link, such as "Motion presets are here. Try them in Studio".',
      dont: 'Put a paragraph, a list or several links in the bar; anything longer belongs on a page the link opens.',
      visual: true,
    },
    {
      id: 'remember-dismissal',
      do: 'Store the dismissal from `onDismiss` so the bar stays closed on the next visit.',
      dont: 'Bring the same bar back on every page load after someone has closed it.',
      visual: false,
    },
  ],
  a11y: [
    'The bar is a labelled region ("Announcement" by default), so screen-reader users can find or skip it.',
    'Text is the dark brand label color on lime, well above 4.5:1.',
    'The lime focus ring would vanish on lime, so the link and the close button switch to a dark ring on the bar.',
    'The close button is named "Dismiss announcement". After it closes the bar is removed; if the bar held focus, move focus to the page\'s main heading in `onDismiss`.',
  ],
  tokens: ['--brand', '--brand-foreground', '--ring'],
}
