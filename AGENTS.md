# Shortn

A URL shortener monorepo (Turborepo + Yarn workspaces): Fastify API + SvelteKit frontend, deployed to Railway.

**Package manager**: Yarn 1.x (`yarn`). Never use npm or pnpm.

**Workspaces**:
- `apps/api` — Fastify 5, Kysely, PostgreSQL, Redis, TypeScript, esbuild
- `apps/client` — SvelteKit 2, Svelte 5, Tailwind CSS v4, Vite
- `packages/eslint-config` — Shared ESLint presets (`./base`, `./api`, `./client`)
- `packages/typescript-config` — Shared TypeScript configs (`tsconfig.base/api/client.json`)
- `bruno/` — Bruno API collection for manual endpoint testing

## Domain Concepts

**Short URL types**: *Generated* (auto ID-based; `urls` table, id sequence starts at 10000) and *custom* (user-defined code; `custom_urls` table, codes are alphanumeric + `-_`, 1–50 chars).

**Service account**: A special DB user (`service-account@<client_hostname>`) with unlimited rate limits. The SvelteKit server uses it (via `API_KEY` env var) to shorten URLs for unauthenticated visitors through the `/api/url/shorten` SvelteKit endpoint. Service account cannot create custom URLs.

**API keys**: Users hold up to 5. Keys are 64-char hex (32 random bytes), stored as SHA-256 hashes in `api_keys.keyHash`. Only the last 4 chars are shown to users after creation.

## API (`apps/api`)

**Entry point**: `lib/app.ts`. Fastify plugin registration order is load-order sensitive:
`zod-openapi → log → error → helmet → db → auth → rateLimit → notFound → cors → helpers → services → docs → router`

**Routes**:
- `GET /health`
- `POST /auth/register`, `POST /auth/login`, `GET /auth/status`, `POST /auth/refresh`, `GET /auth/logout`
- `PATCH /auth/user`, `PATCH /auth/password`, `DELETE /auth`
- `GET /auth/api-keys`, `POST /auth/api-keys`, `PATCH /auth/api-keys/:id`, `DELETE /auth/api-keys/:id`
- `POST /url/shorten`, `POST /url/redirect`, `GET /url/generated`, `GET /url/custom`, `POST /url/:id`, `DELETE /url/:id`

**Auth decorators** (defined in `lib/plugins/auth.plugin.ts`):
- `app.authenticate` — accepts JWT session cookies OR Bearer/Token API key header
- `app.authenticateSession` — session-only (rejects API key users)
- `restrictAuthEndpoints` hook — blocks API key users and cross-origin requests on auth routes

**Config** (`lib/common/config.ts`): Zod-validated, decorated as `app.config`. Namespaces: `HTTP` (HOST, PORT, BASE_URL, CLIENT_URL, DOCS_URL, ALLOWED_ORIGINS), `AUTH` (COOKIE_SECRET, JWT secrets + expiry, SERVICE_ACCOUNT_EMAIL), `DATABASE.URL`, `REDIS.URL`, `IS_LOCAL`, `IS_PRODUCTION`.

Key env vars: `COOKIE_SECRET` and `JWT_SECRET` must be exactly 32 chars. `ALLOWED_ORIGINS` is comma-separated.

**Rate limits** (via `lib/plugins/rateLimit.plugin.ts`): API key 5000/min, session 2500/min, unauthenticated 1000/min, 404 handler 23/min. Service account and `/` endpoint are exempt.

**Redis caching** (`lib/services/cache.service.ts`): Key format `{kind}:{key}`. Kinds: `refresh` (TTL = `JWT_REFRESH_EXPIRES_IN_SECONDS`), `generated_url` (86400s), `custom_url` (604800s). Cache is checked before DB queries; invalidated on delete.

**Validation + OpenAPI**: Zod schemas in `lib/schemas/` power both runtime validation and Swagger docs (`/docs`). Uses `fastify-zod-openapi`. Response envelope defined in `api-response.schema.ts` — `BaseSuccessSchema` / `BaseErrorSchema`.

**Build**: `node esbuild.mjs` → `dist/app.js`. All packages external, ESM, minified. Dev: `tsx watch lib/app.ts`.

## Database

PostgreSQL, schema `shortn`. Migrations in `apps/api/db/migrations/` (7 migrations, kysely-ctl).

**Tables**:
- `shortn.users` — id, fullName, email, password, createdAt, updatedAt. Trigger prevents service account deletion.
- `shortn.urls` — id (starts at 10000), url, userId (FK cascade), createdAt. Index on userId.
- `shortn.custom_urls` — id, userId (FK cascade), url, customCode (unique), createdAt, updatedAt. Index on userId.
- `shortn.api_keys` — id, userId (FK cascade), keyHash (unique), lastFour, name, isActive, createdAt, lastUsedAt, updatedAt.

All tables except `urls` have `updated_at` auto-update triggers.

**Kysely CamelCasePlugin**: DB columns are snake_case, TypeScript types are camelCase. Auto-generated types live in `lib/types/db.d.ts` (do not edit manually).

**Commands** (run from `apps/api/` workspace or with `--filter api`):
- `yarn db:migrate` — apply pending migrations
- `yarn db:generate` — regenerate `lib/types/db.d.ts` from live DB schema

## Frontend (`apps/client`)

**Route groups** (SvelteKit file-based routing):
- `/(authenticated)/web/dashboard` — URL management (generated + custom tabs) and API key management
- `/(authenticated)/web/account` — Profile, password change, account deletion
- `/(unauthenticated)/web/login`, `/web/register` — Redirects away if already authenticated
- `/(shortened-url)/[slug]` — Server-side redirect for generated URLs
- `/(shortened-url)/c/[slug]` — Server-side redirect for custom URLs
- `/api/url/shorten` — SvelteKit `+server.ts` endpoint; uses server-only `API_KEY` env var (not prefixed with `VITE_`)
- `/sitemap.xml` — Programmatically generated sitemap

**API client** (`lib/services/api/`): Abstract `Service` base class (`base.api.ts`) wraps fetch with 10s timeout, auto token-refresh on 401, and cache invalidation. `api.client.ts` for browser (no API key), `api.server.ts` for server-side routes (with `API_KEY`).

**Auth state**: `authStore` (Svelte writable store, `lib/stores/auth.store.ts`). Restored from localStorage on mount via `setAuthenticatedFromTokens()`. `TokenRefreshManager` prevents concurrent refresh races.

**Client-side cache** (`lib/services/cache.service.ts`): In-memory + localStorage, 1-minute TTL. Kinds: `GENERATED_URLS`, `CUSTOM_URLS`, `API_KEYS`. Invalidated on mutation operations.

**Key env vars** (client):
- `VITE_API_BASE_URL` — API URL for browser requests
- `VITE_API_BASE_URL_SERVER` — API URL for server-side requests (Docker internal hostname)
- `VITE_CLIENT_URL`, `VITE_DOCS_URL`
- `API_KEY` — Server-only, never exposed to browser

## Development

**Full local dev with Docker** (recommended):
```
docker compose -f docker-compose.dev.yml up
```
Starts PostgreSQL (host port 5433), Redis (host port 6381), API (3124), Client (3024). API container auto-runs `yarn db:migrate` on startup.

**Without Docker**: `yarn dev` runs both workspaces concurrently via Turbo. Requires external PostgreSQL + Redis and env files at `apps/api/.env` and `apps/client/.env`.

**Other commands** (root):
- `yarn check-types` — TypeScript checking across all workspaces
- `yarn lint` — ESLint (all errors converted to warnings via `eslint-plugin-only-warn`)
- `yarn format` — Prettier (tabs, 120-char width, no trailing commas)
- `yarn build` — Production build (Turbo, depends on `clean`)
- `yarn clean` — Remove `.turbo/`, `out/`, and workspace artifacts

**No tests exist** in this codebase. No Husky or lint-staged.

## CI/CD (GitHub Actions)

- `check-pr.yml` — On PR to `master`: path-based change detection → type check → lint → conditional builds
- `deploy.yml` — On push to `master`: same checks + Railway deployments

Builds run inside Railway environment via `railway run yarn build --filter api` / `--filter client` to access Railway secrets. Uses Railway CLI container (`ghcr.io/railwayapp/cli`).

Required GitHub secrets/vars: `RAILWAY_API_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_API_SERVICE_ID`, `RAILWAY_CLIENT_SERVICE_ID`.

**Renovate** (`.renovaterc`): Auto-merge PRs on Saturdays before 7am, 3-day minimum release age, groups ESLint + patch updates.

## Key Patterns

- **Fastify decoration pattern**: `app.config`, `app.db`, `app.authenticate`, and services are decorated onto the Fastify instance and available in all route handlers via `fastify` argument.
- **Service layer**: `AuthService`, `UrlService`, `CacheService` registered as Fastify plugins and decorated onto `app`. Business logic lives here, not in route handlers.
- **OpenAPI-first**: Route schemas in `lib/schemas/` define both validation and docs. `createResponseSchema<T>()` generates typed response schemas per status code.
- **Monorepo filter**: Run workspace-specific scripts with `yarn workspace @repo/<name> <script>` or `yarn turbo run <task> --filter <workspace>`.

## When in Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- Interview user in detail (for Claude: use the AskUserQuestionTool) about literally anything: technical implementation, UI & UX, concerns, tradeoffs, etc. but make sure the questions are not obvious. Be very in-depth and continue interviewing the user continually until it's complete. Use the answers to create a detailed spec.
- Make assumptions explicit: When you must proceed under uncertainty, list assumptions up front and continue.
