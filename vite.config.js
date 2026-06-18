import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Public production origin, prepended to image paths so og:image / twitter:image
// are absolute URLs (required by most social-link-preview crawlers).
const ORIGIN = 'https://by-maria-delia.github.io'

// Default favicon (used when seo.favicon is empty in site.json): the 🧵 emoji
// rendered as an inline SVG data URI.
const DEFAULT_FAVICON =
  'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧵</text></svg>'

function escapeAttr(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])
}

function absoluteUrl(p) {
  if (!p) return ''
  if (/^https?:\/\//.test(p)) return p
  return ORIGIN + (p.startsWith('/') ? p : '/' + p)
}

// Reads SEO fields from src/content/site.json at build (and dev) time and
// substitutes %SEO_*% placeholders in index.html. This is build-time on
// purpose: most social-link-preview crawlers (WhatsApp, Facebook) don't run
// JS, so any runtime React update to <head> would be invisible to them.
function siteSeoPlugin() {
  return {
    name: 'site-seo',
    transformIndexHtml(html) {
      const seoPath = resolve(process.cwd(), 'src/content/seo.json')
      let seo = {}
      try {
        seo = JSON.parse(readFileSync(seoPath, 'utf-8'))
      } catch {
        // seo.json missing or malformed: fall through with empty defaults so
        // the build still succeeds. Production should never hit this branch.
      }
      const title = seo.title || 'Maria Delia'
      const description = seo.description || ''
      const image = absoluteUrl(seo.image)
      const imageAlt = seo.imageAlt || ''
      // Favicon is emitted raw (the default value is an SVG data URI that
      // contains < and >, which escapeAttr would mangle). Maria-uploaded
      // favicons come from the media library as clean paths.
      const favicon = seo.favicon || DEFAULT_FAVICON
      return html
        .replaceAll('%SEO_TITLE%', escapeAttr(title))
        .replaceAll('%SEO_DESCRIPTION%', escapeAttr(description))
        .replaceAll('%SEO_IMAGE%', escapeAttr(image))
        .replaceAll('%SEO_IMAGE_ALT%', escapeAttr(imageAlt))
        .replaceAll('%SEO_URL%', ORIGIN + '/')
        .replaceAll('%SEO_FAVICON%', favicon)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteSeoPlugin()],
  base: '/',
})
