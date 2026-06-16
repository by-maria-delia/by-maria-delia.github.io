# Maria Delia - Project Guide

## Stack
React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4. Content authored in-repo and edited via Sveltia CMS. Linting: ESLint + Biome. Deployed via the official GitHub Pages action on push to `main`; staging is on Netlify from the `preview` branch.

## Commands
- `yarn dev`: start dev server
- `yarn build`: production build (vite)
- `yarn lint`: run ESLint
- `yarn deploy`: build + deploy to GitHub Pages

## Data Flow
- All content lives in-repo under `src/content/` as JSON, loaded by typed `.ts` loaders and exposed through hooks in `src/data/index.ts`. There are **zero runtime API calls** (no Google Sheets/Drive).
- Non-technical editors manage content through **Sveltia CMS** at `/admin/` (GitHub backend). Saves commit to the **`preview`** branch (not `main`); Netlify auto-deploys it to `https://maria-delia-preview.netlify.app/`. The editor then clicks **Publicar a produccion** in `/admin/`, which dispatches `.github/workflows/promote.yml` to fast-forward `main` to `preview`. The push to `main` triggers `.github/workflows/deploy.yml` (official GitHub Pages action) and the live site updates. See `docs/cms-auth-setup.md` and `docs/handoff-staging-branch.md`.
- Products filter by `disponible === "TRUE"`, gallery by `visible === "TRUE"`.
- Customizer modal collects size/pocket/print selections, then opens WhatsApp with a pre-filled message.

## Brand & Design

### Colors ("Recreo" palette — use the token names in Tailwind classes, e.g. `bg-sky`, `text-ink`)
Defined in `src/index.css` `@theme`. Each surface color pairs with a deeper accent of the same hue.
| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | #FFFDF9 | Main page background |
| `sand` | #F4F0E8 | Subtle surfaces (image wells, idle option chips) |
| `sky` | #C3E1F2 | Soft blue surfaces, highlights, "Cómo encargar" section |
| `sky-deep` | #5E93B5 | Primary blue buttons |
| `sky-ink` | #3E6C8A | Dark blue: logo, headings on light blue, footer bg |
| `pink` | #F8C7D7 | Soft pink surfaces |
| `pink-deep` | #E486A4 | Primary CTA accent, selected states |
| `butter` | #FBEAAE | Warm yellow surfaces, "Galería" section |
| `butter-deep` | #D7A93B | Warm yellow accent |
| `mint` | #C9E9D5 | Soft green surfaces, "Hecho a mano" section |
| `mint-deep` | #65AE85 | Green accent, WhatsApp pill / submit |
| `ink` | #3D4651 | Main text |
| `muted` | #737E8B | Secondary text, muted labels |
| `line` | #ECE6DC | Borders, dividers, scrollbar |

Section backgrounds flow through SVG wave dividers (cream → sky → cream → butter → mint → footer).

### Fonts (loaded from Google Fonts)
- **Oooh Baby** (`font-display`): display/branding (hero title, logo, delivery footnote)
- **Baloo 2** (`font-head`): headings, eyebrow pills, buttons, UI labels
- **Nunito** (`font-body`): body text, navigation, paragraphs

### Brand Personality
Artesanal, calido, prolijo, clasico, amigable, docente, femenino. All copy in **Spanish (Argentina)**.

## Conventions
- Locale: `es-AR` for price formatting (`toLocaleString("es-AR")`)
- Animations: FadeUp wrapper component + CSS keyframes (fade-up, fade-in, slide-down) with stagger delays
- Responsive: mobile-first with md/lg breakpoints, hamburger menu on mobile
- Vite base path: `/`

## Environment Variables
None. The site is fully static and reads all content from in-repo files under `src/content/`.

## CodeSeeker MCP Tools - MANDATORY FOR CODE DISCOVERY

**CRITICAL**: This project has CodeSeeker MCP tools available. You MUST use them as your PRIMARY method for code discovery, NOT grep/glob.

### Auto-Initialization Check

**BEFORE any code search**, verify the project is indexed:
1. Call `projects()` to see indexed projects
2. If this project is NOT listed, call `index({path: "PROJECT_ROOT_PATH"})` first
3. If tools return "Not connected", the MCP server may need restart

### When to Use CodeSeeker (DEFAULT)

**ALWAYS use CodeSeeker for these queries:**
- "Where is X handled?" → `search({query: "X handling logic"})`
- "Find the auth/login/validation code" → `search({query: "authentication"})`
- "How does Y work?" → `search({query: "Y implementation", read: true})`
- "What calls/imports Z?" → `analyze({action: "dependencies", filepath: "path/to/Z"})`
- "Show me the error handling" → `search({query: "error handling patterns", read: true})`

| Task | MUST Use | NOT This |
|------|----------|----------|
| Find code by meaning | `search({query: "authentication logic"})` | ❌ `grep -r "auth"` |
| Search + read files | `search({query: "error handling", read: true})` | ❌ `grep` then `cat` |
| Show dependencies | `analyze({action: "dependencies", filepath: "..."})` | ❌ Manual file reading |
| Find patterns | `analyze({action: "standards"})` | ❌ Searching manually |
| Understand a file | `search({filepath: "..."})` | ❌ Just Read alone |

### When to Use grep/glob (EXCEPTIONS ONLY)

Only fall back to grep/glob when:
- Searching for **exact literal strings** (UUIDs, specific error codes, magic numbers)
- Using **regex patterns** that semantic search can't handle
- You **already know the exact file path**

### Why CodeSeeker is Better

```
❌ grep -r "error handling" src/
   → Only finds literal text "error handling"

✅ search("how errors are handled")
   → Finds: try-catch blocks, .catch() callbacks, error responses,
     validation errors, custom Error classes - even if they don't
     contain the words "error handling"
```

### Available MCP Tools (3 consolidated)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search({query})` | Semantic search | First choice for any "find X" query |
| `search({query, read: true})` | Search + read combined | When you need file contents |
| `search({filepath})` | File + related code | Reading a file for the first time |
| `analyze({action: "dependencies", filepath})` | Dependency graph | "What uses this?" |
| `analyze({action: "standards"})` | Project patterns | Before writing new code |
| `analyze({action: "duplicates"})` | Find duplicate code | Code cleanup |
| `analyze({action: "dead_code"})` | Find unused code | Architecture review |
| `index({action: "init", path})` | Index a project | If project not indexed |
| `index({action: "sync", changes})` | Update index | After editing files |
| `index({action: "status"})` | Show indexed projects | Check if project is indexed |

### Keep Index Updated

After using Edit/Write tools, call:
```
index({action: "sync", changes: [{type: "modified", path: "path/to/file"}]})
```

## Claude Code Best Practices (from 2000+ hours of expert usage)

### Subagent Strategy for Complex Tasks
- For multi-step or complex tasks, spawn subagents using the **main model** (not cheaper/smaller models) instead of cramming everything into one context
- Pattern: "Orchestrator coordinates + focused subagents execute" >> "Single massive context"
- Use subagents MORE than you think necessary, especially for large codebases
- Each subagent gets fresh, focused context = better quality output

### Context Hygiene - Prevent "Lost in the Middle"
- Quality degrades as context grows - the "lost in the middle" problem is real
- Use **double-escape (Esc Esc)** to time travel when context gets polluted with failed attempts
- Compact strategically and intentionally, not automatically
- When output quality drops, consider starting fresh rather than adding more context

### Error Attribution Mindset
- Issues in AI-generated code trace back to **prompting or context engineering**
- When something fails, ask "what context was missing?" not "the AI is broken"
- Log failures mentally: prompt → context → outcome. Patterns will emerge.
- Better input = better output. Always.
