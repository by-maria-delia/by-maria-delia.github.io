# PRD: Replace Google Sheets + Drive with Sveltia CMS

Status: Ready for breakdown (see `/to-issues`)
Related: `docs/adr/0001-sveltia-cms-replaces-google-sheets.md`, `CONTEXT.md`

## Problem Statement

The owner (the Editor) maintains the storefront's content in Google Sheets and Google
Drive: guardapolvo names, prices, descriptions, availability, the global sizes list,
gallery photos, and the stamp and pocket option galleries. Updating anything means
editing spreadsheet cells and Drive folders whose structure must match conventions she
cannot see (folder names matching product names, a specific sizes cell, an availability
column spelled exactly `TRUE`). Images have to be uploaded to the right Drive folder and
then picked up by a build. The setup is fragile, opaque, and not something a
non-technical owner can confidently operate.

Underneath, the site pays for this with real complexity: a Google Drive API key, a
build-time prefetch script that downloads every sheet and image, an image-id manifest, a
"live in dev, static in prod" data layer, and a 6-hour cron rebuild to keep the published
site in sync. None of this adds value for shoppers; it exists only to make a spreadsheet
behave like a content system.

## Solution

Replace Google Sheets and Drive with Sveltia CMS, a git-based headless CMS. Content and
images live in the repository as structured files. The Editor signs in with a GitHub
account and manages everything through a friendly admin UI at `/admin/`: she edits
guardapolvos, prices, descriptions, availability, the sizes list, the gallery, the stamp
and pocket options, and all site copy, then saves. A save commits to the repo, which
triggers an automatic build and deploy to GitHub Pages. No spreadsheet, no Drive folders,
no API key, no manual conventions.

The site stays pure-static on GitHub Pages. The entire Google prefetch pipeline is
removed. Shoppers see exactly the same storefront and Customizer flow as before.

## User Stories

### Editor (shop owner): content management

1. As an Editor, I want to sign in to a CMS with my GitHub account, so that I can manage the site without a developer.
2. As an Editor, I want to land in a clear admin dashboard listing guardapolvos, gallery, stamps, pockets, and site settings, so that I know where to change each thing.
3. As an Editor, I want to add a new guardapolvo with a name, price, description, and photos, so that I can grow the catalog myself.
4. As an Editor, I want to edit an existing guardapolvo's price, so that prices stay current without touching a spreadsheet.
5. As an Editor, I want to enter a price as a plain number, so that I do not have to format currency by hand.
6. As an Editor, I want an optional text price override (e.g. "Consultar"), so that I can handle special cases where a number is not appropriate.
7. As an Editor, I want to edit a guardapolvo's description with line breaks, so that the product text reads the way I intend.
8. As an Editor, I want to mark a guardapolvo as available or not, so that I can hide a product without deleting it.
9. As an Editor, I want unavailable guardapolvos to disappear from the storefront automatically, so that shoppers never see something I cannot make.
10. As an Editor, I want to upload one or more photos to a guardapolvo, so that its card and carousel show the right images.
11. As an Editor, I want to reorder a guardapolvo's photos, so that the first image is the one shoppers see first.
12. As an Editor, I want uploaded images to be optimized automatically, so that the site stays fast without me resizing files.
13. As an Editor, I want to delete a guardapolvo, so that I can retire a model permanently.
14. As an Editor, I want to manage the gallery of real photos, adding, removing, and captioning them, so that the social-proof section stays fresh.
15. As an Editor, I want to toggle a gallery photo's visibility, so that I can stage photos without showing them yet.
16. As an Editor, I want to manage the stamp (print) options as a gallery of images, so that the Customizer offers current prints.
17. As an Editor, I want to manage the pocket options as a gallery of images, so that the Customizer offers current pockets.
18. As an Editor, I want to edit the global sizes list, so that the Customizer always offers the sizes I actually make.
19. As an Editor, I want to edit the WhatsApp number that receives orders, so that I can change it without a developer.
20. As an Editor, I want to edit the Instagram link, so that the social link stays correct.
21. As an Editor, I want to edit the delivery and how-it-works copy, so that I can clarify shipping and process wording.
22. As an Editor, I want to edit the hero and other landing-section copy, so that the storefront's messaging is mine to control.
23. As an Editor, I want my saves to publish to the live site automatically, so that I do not have to ask anyone to deploy.
24. As an Editor, I want to use the CMS from my phone, so that I can update content without a computer.
25. As an Editor, I want a mistake to be revertable, so that a bad edit is not permanent (changes are versioned in git).

### Shopper: unchanged storefront experience

26. As a shopper, I want to browse the available guardapolvos with photos, prices, and descriptions, so that I can choose one.
27. As a shopper, I want to open a guardapolvo and view its photo carousel, so that I can see it in detail.
28. As a shopper, I want to open the Customizer and pick a size, so that I order the right fit.
29. As a shopper, I want to pick a pocket style from the available options, so that I personalize my guardapolvo.
30. As a shopper, I want to pick a print/stamp from the available options, so that I personalize my guardapolvo.
31. As a shopper, I want to add extra comments, so that I can note special requests.
32. As a shopper, I want to see the size guide, so that I choose correctly.
33. As a shopper, I want a pre-filled WhatsApp message with my selections, so that I can place the order in one tap.
34. As a shopper, I want to browse the gallery of finished guardapolvos, so that I gain confidence before ordering.
35. As a shopper, I want prices shown in Argentine format ($50.000,00), so that they read naturally to me.
36. As a shopper, I want the site to load fast, so that I do not abandon it.

### Developer / operator: migration outcomes

37. As a developer, I want the Google prefetch script, Drive API key, and CSV parsing removed, so that the codebase no longer carries spreadsheet-shaped complexity.
38. As a developer, I want the data hooks to keep their existing return shapes, so that the storefront components require minimal change.
39. As a developer, I want content read from in-repo files instead of Google, so that there is a single, inspectable source of truth.
40. As a developer, I want the 6-hour cron and prefetch step removed from CI, so that the pipeline only builds and deploys on content commits.
41. As a developer, I want a one-time, documented OAuth/Worker setup, so that the Editor's GitHub login works reliably.
42. As a developer, I want the masked-model design system and Customizer logic left untouched, so that the visual experience is preserved.

## Implementation Decisions

- **CMS**: Sveltia CMS, embedded as a static admin app at `public/admin/` (an `index.html` loading the Sveltia bundle plus a `config.yml`). Pure-static; no Node data layer, no third-party content service.
- **Hosting**: unchanged. GitHub Pages, org root, Vite `base: '/'`, deployed from the `gh-pages` branch.
- **Auth**: GitHub backend with OAuth via a self-hosted Cloudflare Worker (sveltia-cms-auth). The Editor needs a GitHub account with write access to the repo. There is no email/password path (Netlify Identity is deprecated; Sveltia does not support git-gateway).
- **Content model**:
  - **Guardapolvo (Product)** collection: one file per product. Fields: name, price (number), price text override (optional string), description (long text), available (boolean), images (ordered list).
  - **Gallery** collection: image plus optional caption plus visible (boolean).
  - **Stamp** collection: image (global; same options for every product).
  - **Pocket** collection: image (global; same options for every product).
  - **Site Settings / Content** singleton: global sizes list, WhatsApp number, Instagram URL, delivery/how-it-works copy, hero and remaining section copy.
- **Options scope**: sizes, stamps, and pockets are global, matching today's behavior.
- **Images**: committed into the repo (e.g. under `public/`), auto-optimized to WebP on upload by Sveltia. Expected catalog volume is small and stable. Media can move to external storage (e.g. Cloudflare R2) later without changing the content model.
- **Price formatting**: stored as a number and formatted to es-AR (`$50.000,00`) at render. If the optional text override is present, it is shown verbatim instead.
- **Data layer**: the public hooks (`useProducts`, `useProductsDetails`, `useGalleryImages`, `useStampImages`, `usePocketsImages`, `useProductImages`) keep their current return shapes but read from in-repo content instead of Google. The old per-product image folder name-matching is replaced by an explicit ordered image list on each guardapolvo.
- **Copy extraction**: hardcoded Spanish strings in the storefront components (Hero, HowItWorks, DeliveryInfo, Footer, nav, etc.) move into the Site Content singleton so the Editor controls them.
- **Removed**: `scripts/prefetch.mjs`, `scripts/create-stubs.mjs`, `useGoogleSheet`, `useDriveFolder`, generated `src/data/*.json` and `drive-manifest.json`, `public/drive-images/`, the Google env vars and Drive API key, and the CI prefetch step + 6-hour cron.
- **CI**: the GitHub Action keeps only push-triggered build + deploy. A CMS save commits to the repo and auto-deploys.
- **Existing live data**: the current guardapolvos, prices, descriptions, gallery, stamps, and pockets are migrated out of the sheet/Drive into the new content files as part of the cutover (one-time seeding), so the site launches with real content.

## Testing Decisions

Automated tests are intentionally not part of this work, by the owner's decision. No test
framework will be added. Verification is manual: run the site locally and in a preview
deploy, confirm available guardapolvos render with correct prices and images, confirm the
Customizer composes the expected WhatsApp message, confirm the gallery/stamps/pockets
render, and confirm an Editor edit in the CMS commits and deploys end to end.

## Out of Scope

- Automated tests of any kind.
- GitHub-issue-based tracking (this PRD lives as a markdown file and is broken down via `/to-issues`).
- Email/password (non-GitHub) editor login.
- Per-product sizes, stamps, or pockets (everything stays global).
- External media storage (images stay in-repo for now).
- A draft/review editorial workflow (saves publish directly).
- Any change to the Customizer flow, WhatsApp message format, masked-model design system, branding, or styling.
- A checkout or payment system (sales continue over WhatsApp).
- Restructuring hosting or moving off GitHub Pages.

## Further Notes

- Two setup steps require the owner/developer out of band: (1) create a GitHub OAuth App and deploy the sveltia-cms-auth Cloudflare Worker (free), and (2) grant the Editor's GitHub account write access to `by-maria-delia/maria-delia-website`. Both should be documented in the repo for repeatability.
- Because content and images are versioned in git, every change is revertable and auditable, which is a meaningful safety net for a non-technical Editor.
- The decision and its trade-offs are recorded in `docs/adr/0001-sveltia-cms-replaces-google-sheets.md`. The domain language used throughout is defined in `CONTEXT.md`.
- Suggested task slices for `/to-issues`: (a) scaffold Sveltia admin + config, (b) define content collections + seed real data, (c) port the data hooks to read in-repo content, (d) price formatting + override, (e) extract site copy into Site Content, (f) remove the Google pipeline + simplify CI, (g) OAuth/Worker setup + docs.
