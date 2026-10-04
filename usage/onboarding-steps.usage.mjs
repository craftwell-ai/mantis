export const usage = {
  name: 'onboarding-steps',
  kind: 'block',
  summary: 'A short welcome flow: a lime progress bar with "Step 1 of 3", one question per step answered either with large single-choice cards or a grid of multi-select rows, and Back and Continue buttons.',
  useWhen: [
    'A new account answers two to five quick questions, such as what they make and which tools they want, before reaching the app.',
    'Each answer is a choice from a fixed list, so the flow can tailor the first screen people see.',
  ],
  alternatives: [
    { name: 'radio-group', when: 'only one question is asked, inside an existing settings page' },
    { name: 'dialog', when: 'the question interrupts work already in progress and must stay small' },
  ],
  rules: [
    {
      id: 'cards-for-one-grid-for-many',
      do: 'Use large cards for a pick-one question with two to four answers, and the compact grid when people can pick several of many.',
      dont: 'Use the grid of checkboxes for a pick-one question; people tick two and cannot tell why the second unticks the first.',
      visual: true,
    },
    {
      id: 'continue-is-white',
      do: 'Keep Continue and Finish setup the white primary button. They confirm answers in a form, an everyday step.',
      dont: 'Make Continue lime. Lime marks a screen\'s one main call to action, such as generating, signing up or buying, and a lime button on every step stops meaning anything.',
      visual: true,
    },
    {
      id: 'few-short-steps',
      do: 'Keep the flow to five steps or fewer and let people go back without losing answers.',
      dont: 'Ask for details the product could learn later, such as a job title before anyone has generated anything.',
      visual: false,
    },
  ],
  a11y: [
    'The progress bar is labelled "Setup progress" and the visible step count says where people are.',
    'Each step\'s options are grouped and named by the question heading. Focus moves to the new heading after Back or Continue.',
    'Continue stays focusable while disabled, so keyboard users can still find it before answering.',
  ],
  tokens: ['--brand', '--glass', '--card', '--muted-foreground', '--primary', '--primary-foreground', '--input', '--ring'],
}
