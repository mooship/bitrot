# Bitrot

Interactive memorial for dead technology. Browse the tombstones of killed products, defunct platforms, and abandoned tech. Pour one out.

## Stack

- **Runtime:** Node 24
- **Frontend:** React 19 + React Compiler, TypeScript, Vite
- **Styling:** CSS Modules, CLSX
- **State:** Zustand
- **Backend:** Cloudflare Workers + KV (pour counts)
- **Hosting:** Cloudflare Pages
- **Linting/Formatting:** Biome
- **Git hooks:** Lefthook

## Dev

```bash
npm install

# SPA on :5173
npm run dev

# Worker on :8787 (optional — pour counts)
npm run worker:dev
```

Copy `.env.example` to `.env` and set `VITE_WORKER_URL=http://localhost:8787` to connect the SPA to the local worker.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run check` | Biome lint + format (write) |
| `npm run worker:dev` | Start Wrangler dev server |
| `npm run worker:deploy` | Deploy worker to Cloudflare |

## Deploy

**Worker:** Create a KV namespace in the Cloudflare dashboard, update the IDs in `worker/wrangler.toml`, then run `npm run worker:deploy`.

**SPA:** Connect the repo to Cloudflare Pages. Build command: `npm run build`. Output directory: `dist`. Set `VITE_WORKER_URL` to your deployed worker URL in Pages environment variables.

**CORS:** After Pages is deployed, set `ALLOWED_ORIGIN` to your Pages URL in the Worker's environment variables via the Cloudflare dashboard.
