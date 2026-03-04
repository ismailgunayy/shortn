# Shortn

URL shortener monorepo. Backend API + SvelteKit frontend, deployed on Railway.

**Package manager**: Yarn 1.22.22 (classic) with workspaces
**Monorepo**: Turborepo
**Apps**: `apps/api` (Fastify 5 backend), `apps/client` (SvelteKit 2 frontend)
**Shared packages**: `@repo/typescript-config`, `@repo/eslint-config`

## Development Commands

From repo root:

- `yarn dev` — start all dev servers (Turborepo TUI)
- `yarn build` — build all apps
- `yarn check-types` — TypeScript validation across workspace
- `yarn lint` — ESLint across workspace
- `yarn format` — Prettier (all files)
- `yarn clean` — clean build outputs and Turbo cache

From `apps/api/` (or `yarn workspace api ...`):

- `yarn db:migrate` — run pending Kysely migrations
- `yarn db:generate` — regenerate TypeScript types from DB schema into `lib/types/db.d.ts`

Local dev with hot reload: `docker compose -f docker-compose.dev.yml up`

## API App (`apps/api`)

Entry point: `lib/app.ts` — initializes Fastify, registers plugins sequentially, starts server.

**Plugin registration order** (in `lib/app.ts`): zod-openapi → log → error → helmet → db → auth → rateLimit → notFound → cors → helpers → services → docs → router. Each plugin in `lib/plugins/` decorates the `app` instance.

**Path alias**: `~/` → `lib/` (configured in `tsconfig.json`).

**Build**: `esbuild.mjs` bundles `lib/app.ts` → `dist/app.js` (ESM, minified, ES2022). Fastify and `@fastify/*` packages are externalized (not bundled). Dev uses `tsx watch lib/app.ts`.

**Routes** (in `lib/controllers/`):

- `GET /health`
- `/auth/*` — register, login, logout, status, refresh, user CRUD, API key management
- `/url/*` — shorten, redirect, list generated/custom URLs, update/delete

**Auth**: Dual mechanism — JWT in signed HTTP-only cookies (`shortn_access_token`, `shortn_refresh_token`) OR `Authorization: Bearer/Token <key>`. Decorators: `app.authenticate` (either method), `app.authenticateSession` (cookie only).

**Rate limits**: 1000 req/min (anon), 2500 (session), 5000 (API key), unlimited (service account). Service account email: `service-account@{CLIENT_URL_hostname}` — protected from deletion by a DB trigger.

**URL encoding**: Generated URL IDs start at 10000 and are base62-encoded to form short codes.

**API keys**: 64-char hex strings stored as SHA256 hashes; max 5 per user; `lastFour` stored for display.

## Database

PostgreSQL with Kysely. All tables in `shortn` schema. `CamelCasePlugin` converts snake_case ↔ camelCase automatically — write camelCase in TypeScript, columns are snake_case in DB.

**Tables**: `shortn.users`, `shortn.urls` (generated), `shortn.customUrls`, `shortn.apiKeys`

Key schema details:

- `shortn.urls.id` starts at 10000 — base62-encoded ID = short code
- `updated_at` on users, customUrls, apiKeys is auto-managed by PostgreSQL triggers
- All URL/API key tables cascade-delete on user removal
- `shortn.apiKeys`: stores `keyHash` (SHA256) + `lastFour`, not the raw key

Migrations: `apps/api/db/migrations/` (7 migrations, prefixed 001*–007*). Config: `apps/api/kysely.config.ts`. Generated types: `apps/api/lib/types/db.d.ts` (`DB` interface with `"shortn.tableName"` keys).

**Redis cache** (`lib/services/cache.service.ts`): namespaced keys — `refresh:{userId}`, `generated_url:{shortCode}`, `custom_url:{customCode}`. TTLs: refresh=7d, generated URL=1d, custom URL=7d.

## Client App (`apps/client`)

Root layout (`src/routes/+layout.svelte`) initializes auth store from localStorage on mount.

**Route groups**:

- `(authenticated)/` — dashboard, account; layout redirects to login if unauthenticated
- `(unauthenticated)/` — login, register; layout redirects to `/` if already authenticated
- `(shortened-url)/[slug]` and `(shortened-url)/c/[slug]` — resolve + 302 redirect
- `api/url/shorten/+server.ts` — server-side proxy using `API_KEY` env var (for unauthenticated URL shortening without exposing service account key to browser)

**Auth**: Tokens in HTTP-only cookies (set/cleared by API). Frontend stores only the user object in localStorage (`shortn_session`). Auth state in `lib/stores/auth.store.ts` (Svelte writable). Token refresh is automatic on 401 via `TokenRefreshManager` in the base service.

**API clients** (`lib/services/api/`):

- `base.api.ts` — abstract `Service` class: handles 401 refresh, 10s timeout, toast errors, cookie credentials
- `api.client.ts` (`clientApi`) — browser, cookie-based auth
- `api.server.ts` (`serverApi`) — SSR, `Authorization: Token {API_KEY}` header
- Client-side response caching via `CacheService` (kinds: `GENERATED_URLS`, `CUSTOM_URLS`, `API_KEYS`, 1-min TTL), invalidated on mutations

**SSR distinction**: `VITE_API_BASE_URL` (browser) vs `VITE_API_BASE_URL_SERVER` (SSR/Docker internal network). Both required.

**Svelte 5 runes** used throughout: `$state`, `$derived`, `$effect` — not legacy `$:` reactive syntax.

**Validation**: Zod schemas in `lib/schemas/` (e.g., `auth.schema.ts` — password min 12 chars).

## Environment Variables

**API** (see `.env.local.dev` for full list):

- `DATABASE_URL`, `REDIS_URL`
- `COOKIE_SECRET`, `JWT_SECRET` (≥32 chars each)
- `JWT_ACCESS_EXPIRES_IN_SECONDS`, `JWT_REFRESH_EXPIRES_IN_SECONDS`
- `BASE_URL`, `CLIENT_URL`, `ALLOWED_ORIGINS`
- `NODE_ENV`, `APP_ENV` (`local` | `production`)

**Client**:

- `VITE_API_BASE_URL` — browser-side API URL
- `VITE_API_BASE_URL_SERVER` — SSR-side API URL (different in Docker)
- `VITE_CLIENT_HOST`, `VITE_CLIENT_URL`, `VITE_DOCS_URL`, `VITE_PORT`
- `API_KEY` — service account key for server-side requests (private, no `VITE_` prefix)

All client env vars validated via Zod in `lib/common/config.ts` at startup.

## Code Style & Tooling

- **Formatter**: Prettier with tabs, `printWidth: 120`, semicolons, no trailing commas. Plugins: svelte + tailwindcss.
- **Linting**: ESLint flat config (v9+). No `console.log` in API (use Fastify logger). `turbo/no-undeclared-env-vars` warns on undeclared Turbo env vars.
- **TypeScript**: strict mode + `noUncheckedIndexedAccess`. API has path alias `~/` → `lib/`.
- **No tests**: No test framework configured anywhere in the monorepo.
- **No git hooks**: Lint/typecheck run manually or in CI only.

## CI/CD

GitHub Actions (`.github/workflows/`): PRs run `check-types` + `lint` + conditional build. Pushes to `master` also deploy via Railway CLI (`ghcr.io/railwayapp/cli`). `dorny/paths-filter` scopes jobs to changed areas (api/client/shared).

## When in Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- Interview user in detail (for Claude: use the AskUserQuestionTool) about literally anything: technical implementation, UI & UX, concerns, tradeoffs, etc. but make sure the questions are not obvious. Be very in-depth and continue interviewing the user continually until it's complete. Use the answers to create a detailed spec.
- Make assumptions explicit: When you must proceed under uncertainty, list assumptions up front and continue.
