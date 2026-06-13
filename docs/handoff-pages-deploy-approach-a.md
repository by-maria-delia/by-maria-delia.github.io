# Handoff: Approach A, switch to the official GitHub Pages deploy

## Goal
Tighten the deploy loop for the Maria Delia site by replacing the
`peaceiris/actions-gh-pages` (push-to-`gh-pages`-branch) deploy with the
**official** GitHub Pages deployment (`actions/upload-pages-artifact` plus
`actions/deploy-pages`). The official path generally propagates faster than a
branch push + CDN catch-up, and reports a real deployment status (useful for the
separate "notify the editor when deploy is done" work noted below).

This is purely a CI/deploy change. Do **not** touch site code, content, the CMS
config, or the design system.

## Repo / branch facts
- Repo (canonical): `by-maria-delia/by-maria-delia.github.io`. This is a
  user/org Pages site, so it must keep this exact name. The old name
  `maria-delia-website` only resolves via GitHub's rename redirect.
- Local git remote already re-pointed to the canonical URL.
- Default branch: `main`. Pushes to `main` trigger deploy.
- Working dir: `/Users/lucas/Desktop/projects/maria-delia`
- Project guide: `CLAUDE.md`. Build = `yarn build` (just `vite build` now).
- The em-dash hook blocks the em-dash character in Write/Edit input (including
  the `old_string`). Use colons/periods/parentheses. See memory
  `feedback-no-em-dash`.

## Current deploy workflow
`.github/workflows/deploy.yml` (as of this session, post-Task-7):
- Triggers: `push` to `main`, `workflow_dispatch`.
- `permissions: contents: write, pages: write, id-token: write`.
- `concurrency: group: pages, cancel-in-progress: true`.
- Steps: checkout, setup-node@v4 (node 20, `cache: yarn`),
  `yarn install --frozen-lockfile`, `yarn build`,
  `peaceiris/actions-gh-pages@v4` publishing `./dist`.
- Measured timing (real run): about 30s total job (setup-node about 15s is the
  biggest chunk; build about 3s; deploy about 3s). The user-perceived wait is
  mostly **GitHub Pages CDN propagation after the job**, which the official
  deploy action should improve.

## What to implement (Approach A)
Convert `deploy.yml` to the canonical two-job official Pages flow:
1. A **build** job: checkout, setup-node (keep `cache: yarn`),
   `yarn install --frozen-lockfile`, `yarn build`,
   `actions/configure-pages@v5` (optional),
   `actions/upload-pages-artifact@v3` with `path: ./dist`.
2. A **deploy** job: `needs: build`, runs on `environment: github-pages`, uses
   `actions/deploy-pages@v4`.
3. Permissions: `pages: write`, `id-token: write` (drop `contents: write` since
   we no longer push to a branch). Keep the `pages` concurrency group; consider
   `cancel-in-progress: false` for deploy so an in-flight publish is not killed.

### Important pre-req (verify first, HITL)
The repo's **Pages source must be set to "GitHub Actions"** (not "Deploy from a
branch"). Currently the site deploys via the `gh-pages` branch, so Pages is
almost certainly set to "Deploy from a branch". Switching the workflow without
switching the Pages source in repo Settings then Pages will break deploys.
- Check: `gh api repos/by-maria-delia/by-maria-delia.github.io/pages --jq '.build_type, .source'`
- The `build_type` should become `workflow`. This may require the user to flip
  it in Settings then Pages (or via `gh api` PUT) since it is a repo setting.
- After switching, the old `gh-pages` branch becomes unused (can be deleted
  later; not required).

## Verification
- Push a trivial content change (or use `workflow_dispatch`) and confirm:
  - Both jobs pass; the `deploy-pages` step outputs a `page_url`.
  - `gh run list --workflow=deploy.yml` shows success.
  - The live site at https://by-maria-delia.github.io/ reflects the change.
  - Time-to-live is at most the old loop (compare against the ~30s job plus
    propagation).
- Do NOT merge straight to `main`; open a PR (the repo's established flow, see
  PRs #1 and #2). Branch off `main`, commit, push, `gh pr create --base main`.
- Commit message convention used in this repo/session: Conventional Commits,
  e.g. `ci(pages): use official GitHub Pages deployment`. End commit body with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
  End PR body with the Claude Code generated-with line.

## Related, separate work (not Approach A)
The user also asked (this session) to investigate **notifying the non-technical
editor when a deploy finishes** (a loading warning or "done" message so they
know when to check the page). That is being researched separately and may
produce its own task. The official Pages deploy (Approach A) helps here because
it exposes a real GitHub Deployment plus `page_url`, which a notifier can
poll/subscribe to. Coordinate so the two changes to `deploy.yml` do not conflict.

Context on why an in-CMS instant preview was ruled out: Sveltia CMS custom
preview templates and editorial workflow are both unimplemented (planned before
1.0). See conversation; docs: https://sveltiacms.app/en/docs/api/preview-templates

## Suggested skills
- `verify`: after switching, run/observe the real deploy to confirm the live
  site updates (this skill is for confirming a change works in the real app).
- `update-config`: only if the Pages source flip or any settings/hook changes
  are needed via config rather than the GitHub UI.
