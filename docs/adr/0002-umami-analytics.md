# 2. Umami Cloud for analytics, cookieless, custom dashboard deferred

Date: 2026-06-18

## Status

Accepted

## Context

The owner needed visibility into three things: how many people visit the site, which guardapolvo models get the most interest, and how many visits actually turn into a WhatsApp order. There was no analytics in place.

Constraints:

- Must be free. The business is small.
- Must be readable by a non-technical owner.
- Must not require a backend. The site is pure-static on GitHub Pages with no env vars and no runtime API keys.
- Audience is primarily Argentina, but cookieless / no-consent-banner defaults keep options open and avoid clutter.

## Decision

Use **Umami Cloud** (free tier, 10k events/month, cookieless, Spanish UI) for both pageviews and a small set of custom events.

- **Three custom events.**
  - `customizer_open` with `model_name`. Fires when a shopper opens the Customizer for a given guardapolvo.
  - `whatsapp_click` with `model_name`, `size`, `base`, `pockets`, `estampado`. Fires when the shopper submits the Customizer to WhatsApp. This is the conversion event.
  - `social_click` with `platform` (`whatsapp` or `instagram`) and `location` (`navbar` or `footer`). Distinguishes contact-intent WhatsApp clicks from the Customizer conversion.
- **No per-step customizer events.** Each step (size selected, base selected, pocket selected, estampado selected) is not tracked individually. The funnel "visits → customizer_open → whatsapp_click" already answers the conversion question; per-step events triple the event volume for a metric the owner is unlikely to act on.
- **No `lightbox_open` event.** The mobile image lightbox is a quality-of-engagement signal that overlaps with `customizer_open`. Skipping it keeps the event list short.
- **Environment filtering via `data-domains`.** The Umami `<script>` carries `data-domains="by-maria-delia.github.io"`. The beacon is a no-op on `localhost` and on the Netlify preview deploy. No `import.meta.env.PROD` plumbing in the React code.
- **Maria-facing dashboard via Umami's built-in Share URL, not a custom page.** Umami exposes a read-only dashboard at a tokenized URL. The owner bookmarks it as "Mis números". A purpose-built page on top of Umami's API was considered and deferred. It would commit us to UI design, copy, API integration, and ongoing maintenance for a dashboard one person looks at occasionally, and Umami's native dashboard is already Spanish-localized and clean. Revisit only if the owner finds the native dashboard noisy.
- **UTM convention.** Instagram links in the bio, stories, and posts must carry `?utm_source=instagram` (or `_story`, `_post`). Instagram's in-app browser strips referrer headers, so without UTMs that traffic shows up as "Direct".

## Consequences

Positive:

- Zero recurring cost at expected traffic levels.
- No cookie consent banner.
- Owner gets the three answers she asked for: visitor count, popular models, WhatsApp conversion. Plus auto-tracked traffic source, device, geography, and time-of-day distribution as bonuses.
- No backend, no env vars, no token rotation. The website ID is non-secret and lives in `index.html`.
- Small surface area: ~10 lines of HTML, one helper file (`src/utils/analytics.ts`), and four click-site instrumentations.

Negative / accepted trade-offs:

- 10k events/month cap on the free tier. At roughly 3 events per engaged visitor, comfortable for current traffic. If exceeded, the realistic moves are Cloudflare Web Analytics (free, unlimited, less polished dashboard) or self-hosting Umami.
- Umami's native dashboard surfaces raw event names like `whatsapp_click`, not curated cards. Acceptable per the conversation; the fallback is to build the deferred Mis números page.
- Per-step customizer drop-off is not measured. If conversion looks suspiciously low and the cause is opaque, this is the first thing to add.
- Owner has to remember the UTM convention when posting Instagram links. Without it, source attribution silently degrades.

## Alternatives considered

- **Cloudflare Web Analytics** (free, unlimited, cookieless). Considered as the fallback if Umami's free tier ever caps out. The deciding factor was UX: CF's analytics lives inside the Cloudflare developer console and lacks the event-property breakdowns that make "most-clicked model" a one-click answer in Umami.
- **PostHog free tier** (1M events/mo, funnels, heatmaps, session replay). Powerful, but heavier script and a busier UI than the owner needs. The single conversion event (WhatsApp click) does not justify a full product-analytics tool.
- **Plausible** (~USD 9/month). The gold-standard non-technical-friendly dashboard, but paid. Worth revisiting if the analytics dashboard becomes a daily-driver for the owner.
- **GA4**. Free and full-featured, but requires a consent banner for EU traffic, has a steep dashboard learning curve, and adds a heavy script. Rejected on owner-readability grounds.
- **Custom "Mis números" page now** (password-gated client-side, Umami API token in JS). Considered. Deferred because the security model is hide-it-not-lock-it (anyone with devtools can extract the token), and the build commits us to maintenance for a dashboard that Umami's native UI may already cover. Revisit if the owner explicitly asks.
