export const usage = {
  name: 'input-group',
  kind: 'component',
  summary: 'An input with icons or buttons inside its frame, such as a search field with a leading magnifier or a link field with a Copy button.',
  useWhen: [
    'An input needs a leading icon, such as search.',
    'An action belongs inside the field, such as Copy beside a share link.',
  ],
  alternatives: [
    { name: 'input', when: 'the field needs nothing inside it' },
  ],
  rules: [
    {
      id: 'one-inline-action',
      do: 'Put at most one action inside the field, such as Copy.',
      dont: 'Crowd several buttons into the field; move them outside it.',
      visual: true,
    },
  ],
  a11y: [
    'Inline buttons need their own accessible names, such as "Copy link".',
    'Matches Input: no resting border (owner decision), lime ring on focus.',
  ],
  tokens: ['--field', '--ring'],
}
