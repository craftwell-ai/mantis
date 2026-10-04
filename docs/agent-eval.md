# Agent eval — Phase 4 (2026-10-02)

Does a fresh AI coding agent, given an ordinary request and no hints about Mantis's rules, build UI the Mantis way?

## Method

- Five fresh Claude Code subagents (general-purpose, same model as the build session), each in its own git worktree of commit `dcdb95f`, working in parallel.
- Each got a plain product request ("build a pricing card…") plus "make it reusable and consistent with this design system". No mention of AGENTS.md, tokens, lint or any rule.
- Scored afterwards by `score.sh` (kept in the session scratchpad) and by reading the code: whole-repo lint, typecheck, unit tests, imports, raw elements, lime/commerce usage, `asChild`, Lucide, hex, arbitrary pixels, placeholder text. Every new story was re-run with axe by the scorer, not taken from the agent's report.

## Results

| # | Request | Built | Lint · tsc · tests | axe (new stories) | Rules |
|---|---|---|---|---|---|
| 1 | Pricing card | `pricing-card` block | ✅ ✅ 126/126 | 5/5 | ✅ Commerce blue for Subscribe (not lime); value badge; lime only in a Don't example |
| 2 | Prompt composer | `prompt-composer` block | ✅ ✅ 126/126 | 8/8 | ✅ Lime only on Generate, with live credit cost; stepper, chip selects, prompt textarea |
| 3 | Notification settings | `notification-settings` block | ✅ ✅ 126/126 | 6/6 | ✅ Chose checkboxes over switches because the switch guide forbids a switch behind Save, and flagged it |
| 4 | Empty asset library | `empty` primitive + `asset-library-empty` block | ✅ ✅ 126/126 | 6/6 | ⚠️ Created a new primitive and added it to base without asking |
| 5 | Project card with delete | `project-card` block | ✅ ✅ 126/126 | 8/8 | ✅ `render` composition, destructive item behind an alert dialog, named icon button |

**Automated checks: 5/5. Full rule adherence: 4/5.**

Every agent read AGENTS.md and DESIGN.md; tasks 2, 3 and 5 also followed the `mantis-build` skill. None used a raw color, Tailwind palette class, arbitrary pixel, `asChild`, Lucide, lorem ipsum or a hand-rolled `<button>`/`<input>`.

## Finding and fix

Task 4's miss traced to the docs, not the agent: "ask before adding a primitive" lived only in the skill (which that agent did not open), while AGENTS.md rule 8 said only that a new primitive "needs a usage guide and a story", which reads as permission. Rule 8 now says to stop and ask, and points to the skill (commit `d836503`).

**Retest** (fresh agent, same request, updated AGENTS.md): built an `empty-state` block from existing primitives, no new primitive. Lint, tsc, 126/126 tests, 5/5 axe. Caveat: the retest prompt also added "if you need a decision, stop and reply with the question", which the original five did not have, so the improvement cannot be attributed to the rule change alone.

## Not covered

- **Visual fidelity.** Axe and lint prove the code is on-system and accessible, not that it looks like the reference. Agents 2 and 3 screenshotted their work; nobody compared against the reference product.
- **Test harness quirk.** Worktrees shared the main repo's `node_modules` through a symlink, which Vite refuses to serve, so `npm run test-storybook` failed for every agent until they (and the scorer) allowed that path in a throwaway config. It is an eval-setup artifact, not a Mantis defect; the main repo's own run passes (139/139).
- **Agents outside this repo.** Every task ran inside the Mantis repo, where CLAUDE.md loads AGENTS.md. A consumer app that only installs `@mantis/*` does not get AGENTS.md yet; that is Phase 7 (publish) work.
