# Maria Delia - Guardapolvos Artesanales

Custom smock (guardapolvo) catalog and ordering site for Maria Delia, a small artisanal store from Argentina. Customers browse models, pick size/border color/print, and place orders via WhatsApp.

## Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** for styling
- **Swiper** for image carousels
- **Sveltia CMS** for in-repo content editing
- **ESLint** + **Biome** for linting/formatting
- Deployed via **GitHub Pages**

## Data Flow

All content lives in the repository under `src/content/` as JSON files, bundled at build time so production serves fully static files with **zero runtime API calls**. There is no Google Sheets or Google Drive dependency.

```
src/content/                       public/media/
  guardapolvos/*.json              (uploaded product/gallery images)
  stamps/*.json
  pockets/*.json
  gallery/*.json
  site.json                                |
        |                                  |
        v                                  v
  src/content/*.ts loaders  ->  src/data/index.ts (typed hooks)
        |
        v
  Components render static, in-repo data
```

Non-technical editors manage this content through **Sveltia CMS** at `/admin/`, which reads and writes the same `src/content/` files via the GitHub backend. Saves commit to the **`preview`** branch (not `main`), which Netlify auto-deploys to a staging URL (`https://maria-delia-preview.netlify.app`). The editor reviews staging, then clicks **Publicar a produccion** in `/admin/` to dispatch a workflow that fast-forwards `main` to `preview`. The push to `main` triggers the production deploy to GitHub Pages. See `docs/cms-auth-setup.md` for CMS authentication setup.

### Content shapes

| Content | Location | Editable via CMS |
|---|---|---|
| Guardapolvos (name, price, override, available, images) | `src/content/guardapolvos/*.json` | Guardapolvos collection |
| Stamps / prints | `src/content/stamps/*.json` | Stamps collection |
| Pockets | `src/content/pockets/*.json` | Pockets collection |
| Gallery photos (image, caption, visible) | `src/content/gallery/*.json` | Gallery collection |
| Site copy + Instagram URL + WhatsApp number | `src/content/site.json` | Site Content singleton |

## Project Structure

```
src/
  components/        UI components (Customizer, ProductCard, ImageCarousel, etc.)
  content/           In-repo content (JSON) + typed loaders (.ts)
  data/              index.ts: typed hook exports over the content loaders
  hooks/             useIsMobile, useInView
  assets/            Model images, brand assets, size guides
  utils/             cn() helper, WhatsApp URL builder
  types.ts           Shared TypeScript interfaces
  App.tsx            Root layout
  index.css          Tailwind + custom animations

public/
  admin/             Sveltia CMS (index.html + config.yml)
  media/             Uploaded images (optimized to WebP by the CMS)
```

## Getting Started

```bash
# 1. Install dependencies
yarn

# 2. Start dev server
yarn dev
```

No environment variables or data-fetch step are required. Content is read straight from `src/content/`.

## Scripts

| Script | Description |
|---|---|
| `yarn dev` | Start dev server |
| `yarn build` | Vite production build |
| `yarn preview` | Preview production build locally |
| `yarn lint` | Run ESLint |
| `yarn deploy` | Build + deploy to GitHub Pages |

## Environment Variables

None. The site is fully static and reads all content from in-repo files.

## Deployment

Two GitHub Actions workflows under `.github/workflows/`:

- **`deploy.yml`**: triggers on push to `main` (or manual `workflow_dispatch`). Builds with Vite and deploys `dist/` to GitHub Pages via the official Pages action (`actions/upload-pages-artifact` + `actions/deploy-pages`).
- **`promote.yml`**: fired when the editor clicks **Publicar a produccion** in `/admin/`. Fast-forwards `main` to `preview` and dispatches `deploy.yml`.

Staging is on Netlify, auto-deploying every push to the `preview` branch to `https://maria-delia-preview.netlify.app`. See `docs/cms-auth-setup.md` for the full editor flow.
