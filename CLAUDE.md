# Bitrot

Interactive memorial for dead technology. React 19 SPA + Cloudflare Worker backend.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Vite SPA on :5173 |
| `npm run build` | Type-check + production build |
| `npm run check` | Biome lint + format (write) |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run worker:dev` | Wrangler dev server on :8787 |
| `npm run worker:deploy` | Deploy worker to Cloudflare |

## Architecture

```
src/
  App.tsx              # Routes: /, /entry/:id, /privacy, /about
  components/          # One folder per component, co-located .module.css + .test.tsx
  data/                # entries.ts (static array), types.ts (DeadTech, enums)
  hooks/               # useDocumentTitle, useScrollReveal, useReducedMotion
  stores/              # Zustand: useFilterStore, usePourStore, useThemeStore
  styles/              # tokens.css (CSS vars), global.css (theme selectors)
  utils/               # color.ts (brand color → accent), seo.ts (dynamic meta)
worker/
  index.ts             # GET /pours, POST /pours/:id — KV-backed pour counts
```

## Code Style

- CSS Modules — `Component.module.css` co-located, imported as `styles`
- No single-line if statements (always use braces)
- No comments unless logic is non-obvious
- `clsx` for conditional classNames
- All theme colours are CSS custom properties — never hard-code colours

## Testing

- Test files: `Component.test.tsx` in the same folder as the component
- Fixtures: `src/test/fixtures.ts` — use `mockEntry` / `mockEntryMinimal`
- `happy-dom` environment; `matchMedia`, `IntersectionObserver`, `clipboard` mocked in `src/test/setup.ts`
- Components using react-router `<Link>` must be wrapped in `<MemoryRouter>` in tests
- Vitest globals enabled — no need to import `describe`, `it`, `vi`

## Environment

Copy `.env.example` → `.env`. Required:
```
VITE_WORKER_URL=http://localhost:8787
```
Worker reads `ALLOWED_ORIGIN` and `POURS` KV from Cloudflare environment (set in `worker/wrangler.toml` / dashboard).

## Gotchas

- **React Compiler is enabled** — don't add manual `useMemo`/`useCallback`; the compiler handles it
- **Theme is dark-first** — default `data-theme="dark"` set in `index.html`; light mode via `[data-theme="light"]` selector in `global.css`
- **Entry brand colours** — optional `brandColor` hex on entries is adapted per-theme via `getAccentColor()` and passed as `--entry-accent` inline CSS var
- **Worker CORS** — strict origin check; any request not from `ALLOWED_ORIGIN` gets a 403 (not a CORS error)
- **Pour counts aggregated** — worker stores a `meta:totals` JSON blob for fast `GET /pours`; individual `pour:<id>` keys are source of truth and rebuild `meta:totals` on miss
- **Scroll reveal** — `useScrollReveal` uses `IntersectionObserver`; mock is in test setup; respects `prefers-reduced-motion`
