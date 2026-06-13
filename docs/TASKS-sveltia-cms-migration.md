# Tasks: Sveltia CMS Migration

Vertical-slice breakdown of `docs/PRD-sveltia-cms-migration.md`. Each task is a thin slice
through every layer (content, loader, hook, render). Work them in dependency order. AFK =
no human needed; HITL = needs a human (decision/setup/review).

Related: `docs/PRD-sveltia-cms-migration.md`, `docs/adr/0001-sveltia-cms-replaces-google-sheets.md`, `CONTEXT.md`

Status legend: `[ ]` todo, `[~]` in progress, `[x]` done.

---

## Task 1: Guardapolvos render from in-repo content `[x]`

Type: AFK
Blocked by: None, can start immediately

### What to build

The foundational slice that establishes the in-repo content mechanism. Define guardapolvo
content files, seeded with the real catalog migrated out of the current Google Sheet
(name, price, optional price text override, description, available flag, ordered image
list). Build the content loader that reads these files into typed `Product` data. Port
`useProducts` and `useProductsDetails` to read from the loader instead of Google, keeping
their existing return shapes. Format price at render: a numeric price becomes es-AR
(`$50.000,00`); when the optional text override is present, show it verbatim. Only
`available` guardapolvos reach the storefront. Product cards and the photo carousel render
from the per-product ordered image list (no more Drive folder name-matching).

### Acceptance criteria

- [x] Guardapolvo content lives in repo files, seeded with the current real catalog.
- [x] A content loader returns typed product data; the existing hook return shapes are unchanged.
- [x] Unavailable guardapolvos do not appear in the storefront.
- [x] Numeric prices render as es-AR (e.g. `$50.000,00`); a text override renders verbatim.
- [x] Product cards and carousel render from each guardapolvo's ordered image list.
- [x] Storefront product browsing works with zero Google requests.

### Blocked by

None, can start immediately.

---

## Task 2: Customizer renders from in-repo content `[x]`

Type: AFK
Blocked by: Task 1

### What to build

Move the Customizer's option sources into the repo. Seed and load the global sizes list,
the stamp (print) gallery, and the pocket gallery. Port `useProductsDetails` (sizes),
`useStampImages`, and `usePocketsImages` to read in-repo content. The Customizer presents
sizes, stamps, and pockets from the repo, all global (same options for every guardapolvo).
The WhatsApp message format and the size guide are unchanged.

### Acceptance criteria

- [x] Sizes, stamps, and pockets are seeded as in-repo content and load via the ported hooks.
- [x] The Customizer shows the global sizes, stamps, and pockets from the repo.
- [x] Selecting size/pocket/stamp/comments composes the same WhatsApp URL as before.
- [x] The size guide still displays.
- [x] No Google requests are made by the Customizer.

### Blocked by

- Task 1 (shares the content-loader pattern).

---

## Task 3: Gallery renders from in-repo content `[x]`

Type: AFK
Blocked by: Task 1

### What to build

Seed the gallery collection (image plus optional caption plus `visible` flag) as in-repo
content and load it. Port `useGalleryImages` to read it, applying the `visible` filter so
hidden photos never render.

### Acceptance criteria

- [x] Gallery photos are seeded as in-repo content with caption and visibility.
- [x] `useGalleryImages` reads in-repo content and keeps its return shape.
- [x] Only `visible` photos appear in the gallery.
- [x] No Google requests are made by the gallery.

### Blocked by

- Task 1 (shares the content-loader pattern).

---

## Task 4: Site copy extracted into Site Content singleton `[x]`

Type: AFK
Blocked by: Task 1

### What to build

Extract hardcoded Spanish copy from the storefront components (hero, how-it-works,
delivery info, footer, navigation) plus the Instagram URL and the WhatsApp number into a
single Site Content singleton, loaded the same way as other content. Components read their
copy and these global values from the singleton instead of from hardcoded strings or env
vars.

### Acceptance criteria

- [x] Hero, how-it-works, delivery, footer, and nav copy come from the Site Content singleton.
- [x] The Instagram URL and the WhatsApp number come from the singleton.
- [x] Changing a value in the singleton changes the rendered site, with no code edit.
- [x] No visible copy regressions versus the current site.

### Blocked by

- Task 1 (shares the content-loader pattern).

---

## Task 5: Sveltia admin scaffolded + config `[ ]`

Type: AFK
Blocked by: Task 1, Task 2, Task 3, Task 4

### What to build

Scaffold the Sveltia CMS admin app at `public/admin/` (an `index.html` loading the Sveltia
bundle plus a `config.yml`). The config describes every content shape created in Tasks 1 to
4: the guardapolvo collection, the gallery, the stamp and pocket collections, and the Site
Content singleton, with field types matching the content (number price, optional override,
boolean available/visible, ordered image lists, image upload to the in-repo media folder
with WebP optimization). The backend is configured for GitHub. Full login is verified in
Task 6, but the config and collection editing UI are authored here.

### Acceptance criteria

- [ ] `/admin/` loads the Sveltia UI.
- [ ] `config.yml` defines collections/singleton matching the Task 1 to 4 content shapes.
- [ ] Field types are correct (numeric price, optional override, booleans, ordered image lists).
- [ ] Image uploads target the in-repo media folder and are optimized to WebP.
- [ ] The GitHub backend is configured (login itself is exercised in Task 6).

### Blocked by

- Task 1, Task 2, Task 3, Task 4 (content shapes must exist for the config to describe them).

---

## Task 6: OAuth App + Cloudflare Worker + access, documented `[ ]`

Type: HITL
Blocked by: Task 5

### What to build

Stand up authentication so the Editor can log in. Create a GitHub OAuth App, deploy the
sveltia-cms-auth Cloudflare Worker (free), wire the `config.yml` backend to the Worker, and
grant the Editor's GitHub account write access to the repo. Document every step in the repo
so it is repeatable. Verify the full loop: the Editor logs in at `/admin/`, makes a content
edit, and the change commits and auto-deploys to the live site.

### Acceptance criteria

- [ ] A GitHub OAuth App exists and the sveltia-cms-auth Worker is deployed.
- [ ] `config.yml` points at the Worker; login at `/admin/` succeeds.
- [ ] The Editor's GitHub account has write access to the repo.
- [ ] An end-to-end edit in the CMS commits to the repo and auto-deploys.
- [ ] The setup steps are documented in the repo.

### Blocked by

- Task 5.

---

## Task 7: Remove Google pipeline + simplify CI `[ ]`

Type: AFK
Blocked by: Task 1, Task 2, Task 3, Task 4

### What to build

Now that all content is read from the repo, delete the Google machinery: the prefetch and
create-stubs scripts, the `useGoogleSheet` and `useDriveFolder` hooks, the generated
`src/data/*.json` and `drive-manifest.json`, the `public/drive-images/` folder, and the
Google env vars and Drive API key references. Simplify the GitHub Action to only build and
deploy on push, dropping the 6-hour cron and the prefetch step. Leave the masked-model
design system and Customizer logic untouched.

### Acceptance criteria

- [ ] Prefetch, create-stubs, `useGoogleSheet`, and `useDriveFolder` are removed.
- [ ] Generated data JSON, the manifest, and `public/drive-images/` are removed.
- [ ] Google env vars and Drive API key references are gone from code, `.env.example`, and CI.
- [ ] The GitHub Action only builds and deploys on push (no cron, no prefetch step).
- [ ] The site builds and deploys cleanly; storefront, Customizer, and gallery still work.

### Blocked by

- Task 1, Task 2, Task 3, Task 4 (the old hooks cannot be removed until every consumer reads in-repo content).
