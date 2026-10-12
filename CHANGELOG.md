# Changelog

## [1.0.4] - 2026-10-12
- Video studio page: the sample's newest clip is real night-street footage, so the canvas shows the video player; the preset picture matches it

## [1.0.3] - 2026-10-11
- Maintainer rules: Paper is the design source of truth and is synced after every Storybook release; Figma is no longer updated
- Removed the unused Figma variable reader (`scripts/figma-variables.mjs`); nothing in Mantis read from it

## [1.0.2] - 2026-10-10
- Home page: the Canvas card's Reference step shows a file name like the other steps, not a blurred gradient

## [1.0.1] - 2026-10-09
- Changelog: the 1.0.0 entry now lists the usage guides published as data, which shipped in 1.0.0 but was left out
- The bump script dates entries by the local calendar, not UTC

## [1.0.0] - 2026-10-07
- First stable release: from here, nothing published is renamed or removed without a major version bump
- Home page, favicon and the mantisdesignsystem.com address
- New blocks: workflow canvas, event map, video player, usage chart, compare slider and upload dropzone
- Every usage guide is also published as data (`/usage/<name>.json`), with a list of all guides at `/usage/index.json`, for tools that read the system
- Site footer lays out from its own width, so it no longer breaks in a narrow area on a wide screen
- Paper boards for every pattern and template, built by script from Storybook
- A version bump and changelog entry now go with every change
- Pushing to main now deploys the site; no deploy command is needed

## [0.1.0] - 2026-07-26
- Template package baseline.
