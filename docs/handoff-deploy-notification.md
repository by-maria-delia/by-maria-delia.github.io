# Handoff: notify the non-technical editor when a deploy finishes

## Goal
After the editor saves in Sveltia CMS (`/admin/`), give her a clear signal that
the site has finished deploying so she knows when to check the live page. The
user is fine with either a "loading warning + done message" in the CMS, or a
message (e.g. to her phone) when the deploy completes. Deploy *speed* is not the
concern here; *knowing when it is done* is.

## Why this is needed (key finding)
Sveltia CMS has **no native deploy-done signal**. Its "saved and published" toast
fires when the Git **commit** lands, not when the GitHub Pages build finishes.
The CMS has zero visibility into the downstream deploy. (Open upstream issue
about the misleading "published" wording:
https://github.com/sveltia/sveltia-cms/issues/706 .) So the signal must be added
by us.

## Facts that make it feasible (verified this session)
- Repo is **public**: `by-maria-delia/by-maria-delia.github.io`. The editor's
  browser can therefore read deploy status from the GitHub REST API
  **unauthenticated** (verified: `200`). Unauthenticated limit is **60 req/hour
  per IP**, so poll conservatively.
- The Actions API returns everything a status indicator needs. Endpoint:
  `GET https://api.github.com/repos/by-maria-delia/by-maria-delia.github.io/actions/runs?branch=main&per_page=1`
  Fields: `workflow_runs[0].status` (`queued`/`in_progress`/`completed`),
  `.conclusion` (`success`/`failure`), `.head_commit.message`, `.created_at`,
  `.updated_at`. Example observed: `completed / success` for a
  "Update Guardapolvo bloque" commit.
- Pages is currently `build_type: legacy` (deploy-from-`gh-pages`-branch). If
  Approach A (official Pages deploy) lands first, the cleaner signal becomes the
  Deployments API + the `github-pages` environment, which also exposes
  `page_url`. The Actions-run polling works on today's legacy setup too, so this
  work does NOT strictly depend on Approach A.

## Repo / project facts
- Working dir: `/Users/lucas/Desktop/projects/maria-delia`
- CMS admin page (where a banner would be injected): `public/admin/index.html`
  (loads `https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`; do NOT add
  `type="module"`).
- Deploy workflow (where a CI notification step would go): `.github/workflows/deploy.yml`
- All editor-facing copy must be **Spanish (Argentina)**. See `CLAUDE.md` brand
  section.
- The em-dash hook blocks the em-dash character in Write/Edit input (including
  `old_string`). Use colons/periods/parentheses. Memory: `feedback-no-em-dash`.
- Established flow: branch off `main`, PR into `main` (see PRs #1, #2). Do not
  push straight to `main`. Conventional Commits; end commit body with
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`,
  end PR body with the Claude Code generated-with line.

## Option 1 (RECOMMENDED): status banner inside `/admin/`
Inject a small vanilla-JS script into `public/admin/index.html` that polls the
Actions runs API and renders a fixed banner over the CMS in Spanish:
- 🟡 `Publicando cambios...` while `status != completed`.
- 🟢 `Cambios publicados. Ver la pagina ->` (link to https://by-maria-delia.github.io/)
  when `status == completed && conclusion == success`.
- 🔴 a failure message when `conclusion == failure`.

Implementation notes / gotchas:
- **Save detection:** Sveltia exposes no documented "saved" event. To avoid idle
  polling (which would blow the 60/hr limit), trigger a short polling burst by
  detecting the save. Practical approach: a `MutationObserver` watching for
  Sveltia's success toast text (the "published/guardado" toast) to start polling.
  Fallback: poll the latest run state at a slow idle cadence only while the tab
  is visible (`document.visibilityState`), and speed up once a run flips to
  `in_progress`.
- **Rate limiting:** burst-poll roughly every 6 to 8s for about 2 minutes after a
  save (about 15 to 20 calls per save), then stop. Handle HTTP 403 (rate limited)
  by backing off and hiding the banner rather than erroring.
- **Detecting "her" deploy vs an unrelated run:** compare `created_at`/commit
  message to the save time, or just treat the latest `main` run as the relevant
  one (fine for a single editor).
- **Token reuse (optional enhancement, fragile):** the editor is OAuth-authed and
  Sveltia stores a GitHub token in the browser. Reusing it would raise the limit
  to 5000/hr, but reaching into Sveltia's undocumented token storage is brittle
  and may break on CMS updates. Prefer unauthenticated + conservative polling.
- Pros: lives where she works, no second app/account, free, no infra. Cons: only
  visible while the admin tab is open; save-detection is slightly hacky.
- Pairs with Approach A: once on the official Pages deploy, switch the poll to the
  Deployments API / `github-pages` environment for a true "live" signal + `page_url`.

## Option 2 (alternative): push message from CI on deploy success
Add a final step to `.github/workflows/deploy.yml` that fires on successful
deploy and messages the editor:
- **Email** (simplest, universal): an SMTP send action, one secret set.
- **Telegram** (free bot, instant, reliable): bot token + chat id as secrets.
- **WhatsApp** (on-brand, the store already uses it): needs Twilio / CallMeBot /
  WhatsApp Business API, so more setup/cost than email or Telegram.
- Pros: reaches her phone, works with the CMS tab closed, robust. Cons: needs a
  channel + secret configured (HITL: user must create the bot/SMTP creds and add
  repo secrets). Copy in Spanish, include the live URL.

Options 1 and 2 compose; shipping both is reasonable.

## Open decisions for the next session (ask the user)
- Banner (Option 1), phone message (Option 2), or both?
- If banner: tie it to Approach A (Deployments API) or make it work on the current
  legacy deploy now (Actions-runs API)?
- If message: which channel (email / Telegram / WhatsApp)? This drives what
  secrets/accounts the user must provision.

## Suggested skills
- `verify`: after building, trigger a real save/deploy and confirm the banner or
  message actually appears at the right time.
- `update-config`: if repo secrets, settings, or hooks need wiring for Option 2.

## Related handoff
Approach A (faster/cleaner deploy via official GitHub Pages action):
`docs/handoff-pages-deploy-approach-a.md`. The two touch `deploy.yml`; coordinate
so they do not conflict, and prefer doing Approach A first if going the
Deployments-API route for the banner.
