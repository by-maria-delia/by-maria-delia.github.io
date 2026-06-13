# 1. Sveltia CMS (git-based) replaces Google Sheets + Drive

Date: 2026-06-13

## Status

Accepted

## Context

The storefront's content (guardapolvos, prices, descriptions, availability, gallery
photos, stamp and pocket options, the global sizes list) lived in Google Sheets tabs
and Google Drive folders. A build-time `prefetch` script pulled every sheet as CSV and
downloaded every Drive image into the repo, producing static JSON plus a `drive-images/`
folder and an id-to-extension manifest. A 6-hour cron rebuild kept the published site in
sync with the spreadsheet.

This worked but carried real cost: a Google Drive API key, brittle CSV parsing, an
image-id manifest, name-matching between Drive subfolders and product names, a
non-obvious "live in dev, static in prod" data layer, and the cron rebuild. None of the
quirks add product value; they exist only to coax a spreadsheet into behaving like a CMS.

The owner needs to update product images, texts, and prices (and, by request, all site
copy) without touching code or a terminal.

## Decision

Replace Google Sheets + Drive with **Sveltia CMS**, a git-based headless CMS.

- **Content lives in the repo** as structured files (one file per guardapolvo, plus
  collections for gallery, stamps, pockets, and a settings/site-content singleton).
- **Images live in the repo**, committed by the CMS, auto-optimized to WebP on upload.
  The catalog is expected to stay small and stable.
- **The site stays pure-static on GitHub Pages** at the org root (`base: '/'`), deployed
  from the `gh-pages` branch.
- **Auth is GitHub OAuth** via a free, self-hosted Cloudflare Worker (sveltia-cms-auth).
  The editor signs in with a GitHub account that has repo access and authorizes the app
  once, then only ever sees the CMS UI at `/admin/`.
- **The prefetch pipeline, Drive API key, CSV parsing, and 6-hour cron are removed.**
  The GitHub Action keeps only push-triggered build + deploy: a CMS save commits to the
  repo, which auto-deploys.

## Consequences

Positive:

- No external data source, no API key, no manifest, no name-matching, no cron. The data
  layer collapses to "read files in the repo."
- The editor gets a modern, phone-friendly UI with image optimization built in.
- Content changes are versioned in git with full history and are trivially revertable.
- Zero new servers and no recurring cost (Cloudflare Worker and GitHub Pages are free).

Negative / accepted trade-offs:

- The editor must have a GitHub account with repo access. There is no email/password
  path: Netlify Identity is deprecated and Sveltia does not support git-gateway.
- A one-time Cloudflare Worker + GitHub OAuth App setup is required.
- Images in git mean repo growth over time. Acceptable at the expected small, stable
  volume; if that changes, media can move to external storage (e.g. Cloudflare R2) later.
- All site copy becomes CMS-managed content, so hardcoded Spanish strings must be
  extracted from components into content files.

## Alternatives considered

- **Decap CMS** (the original): same git-based model and config concept, but a dated UI,
  weaker image handling, and a semi-abandoned, issue-heavy codebase. Sveltia is a drop-in
  successor, so switching back later is cheap if ever needed.
- **TinaCMS**: best inline/visual editing, but introduces a Node.js data layer and a
  cloud service (Tina Cloud) for auth and content. That abandons the pure-static setup
  and adds an external dependency, which is unjustified for a small catalog.
- **Keep Google Sheets**: rejected. It is the source of the quirks this migration exists
  to remove.
