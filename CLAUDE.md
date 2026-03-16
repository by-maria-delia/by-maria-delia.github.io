# Maria Delia - Project Guide

## Stack
React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + React Query (TanStack Query). Linting: ESLint + Biome. Deployed via gh-pages.

## Commands
- `yarn dev` — start dev server
- `yarn build` — production build
- `yarn lint` — run ESLint
- `yarn deploy` — build + deploy to GitHub Pages

## Data Flow
- Products and gallery data come from **Google Sheets CSV** exports, parsed with PapaParse via `useGoogleSheet<T>()`.
- **React Query** manages all data fetching. Use aggressive caching (`staleTime`, `gcTime`) to minimize API hits against Google Sheets rate limits. Prefer long stale times since sheet data changes infrequently.
- Products filter by `disponible === "TRUE"`, gallery by `visible === "TRUE"`.
- Customizer modal collects size/color/print selections, then opens WhatsApp with a pre-filled message.

## Brand & Design

### Colors (use semantic names in Tailwind classes)
| Name | Hex | Usage |
|------|-----|-------|
| School Blue | #9DB7D5 | Primary UI, product backgrounds |
| Denim Blue | #5E6F82 | Secondary buttons, accents |
| Soft White | #F7F7F4 | Main backgrounds |
| Leaf Green | #5E7D6A | Accents, nature references |
| Teacher Pink | #E67A8A | Border trims, small CTA details |
| Warm Yellow | #E3C567 | Tiny details only |
| Floral Teal | #6FAFB4 | Pocket print references |
| Dark Text | #333333 | Main text |
| Soft Gray | #777777 | Secondary text |

### Fonts (loaded from Google Fonts)
- **Oooh Baby** — display/branding (hero title, logo)
- **Nunito** — body text, navigation, UI
- **Shadows Into Light** — handwritten accent (labels, badges)

### Brand Personality
Artesanal, calido, prolijo, clasico, amigable, docente, femenino. All copy in **Spanish (Argentina)**.

## Conventions
- Locale: `es-AR` for price formatting (`toLocaleString("es-AR")`)
- Animations: FadeUp wrapper component + CSS keyframes (fade-up, fade-in, slide-down) with stagger delays
- Responsive: mobile-first with md/lg breakpoints, hamburger menu on mobile
- Env vars prefixed with `VITE_` (accessed via `import.meta.env`)
- Vite base path: `/maria-delia/`

## Environment Variables (.env)
```
VITE_WSP_NUMBER=...
VITE_PRODUCTS_SHEET_CSV_URL=...
```

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

