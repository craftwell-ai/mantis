export const usage = {
  name: 'event-map',
  kind: 'block',
  summary: 'A map for logging events at places: drop a pin, or draw a circle or an area, fill in a title, a type and notes, and the event joins a list and stays marked on the map.',
  useWhen: [
    'People record where something happened or will happen, and the place can be a single point, a radius around a point or a hand-drawn part of a town or village.',
    'A team needs to see logged events on a map, open one for its details and remove it.',
  ],
  alternatives: [
    { name: 'table', when: 'the events have no meaningful location, or people compare them by fields and not by where they are' },
    { name: 'media-grid', when: 'the items are pictures to browse, not places' },
    { name: 'workflow-canvas', when: 'the board shows steps and how they connect, not geography' },
  ],
  rules: [
    {
      id: 'keep-the-data-credit',
      do: 'Leave the small credit in the map\'s corner visible. The street data comes from OpenStreetMap and its license requires the credit.',
      dont: 'Hide or cover the credit with a panel, a toolbar or custom styles.',
      visual: false,
    },
    {
      id: 'one-shape-per-event',
      do: 'Let each event have one location: a pin, a circle or an area. Drawing ends when the shape is finished and the form opens.',
      dont: 'Ask people to draw several shapes before saving; split those into separate events.',
      visual: false,
    },
    {
      id: 'say-how-big',
      do: 'Show the size of what was drawn in words, such as "Circle · 450 m radius" or "Area · about 1.2 km²".',
      dont: 'Leave people to judge an area by eye; the same shape covers very different ground at different zooms.',
      visual: false,
    },
    {
      id: 'store-events-yourself',
      do: 'Save events from `onEventsChange` or `onCreate`; the block holds them only while the page is open.',
      dont: 'Assume the map remembers events after a reload.',
      visual: false,
    },
    {
      id: 'check-coverage-first',
      do: 'Before relying on the free street map for a remote area, look at that area on it. Detail varies a lot outside cities; pass another `mapStyle` if it is too thin.',
      dont: 'Promise satellite imagery or place search; the free map has neither.',
      visual: false,
    },
  ],
  a11y: [
    'The map canvas carries the accessible name given in `label` ("Event map" by default) and can be panned and zoomed with the arrow keys and plus and minus.',
    'Every saved event is also a button in the Events list and a named marker on the map ("Flooded bridge, Incident"), so events can be reached without a pointer.',
    'Tools are a labelled toggle group (Browse, Pin, Circle, Area). While a drawing tool is active a status message says what to do next, and Escape cancels.',
    'Drawing a pin, circle or area needs a pointer. For keyboard-only entry pass `defaultLocation` from another control, such as a place picker or coordinate fields.',
    'Every form field has a visible label; Save is disabled until the event has a title.',
  ],
  tokens: ['--brand', '--background', '--glass-panel', '--glass-border', '--glass', '--muted-foreground', '--ring', '--destructive'],
}
