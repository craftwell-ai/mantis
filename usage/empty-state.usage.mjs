export const usage = {
  name: 'empty-state',
  kind: 'block',
  summary: 'A dashed placeholder that fills the space where content will appear, says what belongs there in one sentence, and offers one button to add the first item, such as an empty asset library asking for a first upload.',
  useWhen: [
    'A library, gallery or list has loaded and holds nothing yet, such as an asset library before the first upload or a project with no generations.',
    'A filter or search returned no results and the person needs a way forward, such as clearing the filter.',
  ],
  alternatives: [
    { name: 'skeleton', when: 'the content is still loading; show the empty state only once you know there is nothing' },
    { name: 'sonner', when: 'an action just removed the last item and you only need to confirm it happened' },
  ],
  rules: [
    {
      id: 'say-what-goes-here',
      do: 'Name the space and say what belongs in it, such as "Upload reference images, logos and textures to reuse them in any project."',
      dont: 'Write only "No items" or "Nothing here", which reads like an error and gives no reason to act.',
      visual: true,
    },
    {
      id: 'one-way-forward',
      do: 'Offer one button that adds the first item, labelled with a verb, such as Upload image.',
      dont: 'Line up several buttons (upload, import, browse, learn more), so nobody knows where to start.',
      visual: true,
    },
    {
      id: 'lime-when-it-starts-creating',
      do: 'Make the button lime `brand` when it starts the first creation and nothing else on screen is lime, such as Upload media in an empty library; keep it white for everyday actions such as Create folder or Clear filters.',
      dont: 'Make the button lime when the page already has a lime action, such as the composer\'s Generate, or for clearing a search; two lime actions compete.',
      visual: true,
    },
    {
      id: 'replace-the-content',
      do: 'Render it in place of the empty grid or list, at the size the content would take, after loading finishes.',
      dont: 'Show it while data is still loading, or stack it above an empty grid frame.',
      visual: false,
    },
  ],
  a11y: [
    'The title is a real heading (`h2` by default). Set `headingTag` so it follows the page outline, for example `h3` inside a section that already has an `h2`.',
    'The icon is decorative and hidden from screen readers; the title and sentence carry the meaning.',
    'For uploads, keep the file input `hidden` and open it from a real `Button`, so keyboard and screen-reader users reach one labelled control instead of a bare file input.',
  ],
  tokens: ['--glass-border', '--glass', '--muted-foreground', '--foreground', '--primary', '--primary-foreground', '--brand', '--brand-foreground'],
}
