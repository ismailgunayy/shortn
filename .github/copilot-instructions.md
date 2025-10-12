# Shortn - AI Coding Assistant Instructions

## Architecture Overview

This is a **TurboRepo monorepo** with a URL shortener service featuring:

- **Backend**: Fastify API (`apps/api/`) with PostgreSQL + Redis
- **Frontend**: SvelteKit 5 client (`apps/client/`)
- **Shared**: TypeScript configs and ESLint configs in `packages/`

## Key Development Patterns

### API Architecture (apps/api/)

- **Plugin-based Fastify setup**: All functionality registered as plugins in `lib/plugins/` with specific order in `app.ts`
- **Layered architecture**: Controllers → Services → Repositories → Database
- **Type-safe database**: Kysely ORM with generated types in `~/types/db` and CamelCase plugin
- **Schema validation**: Zod schemas in `lib/schemas/` with OpenAPI integration via `fastify-zod-openapi`
- **Custom error hierarchy**: Extend `ShortnError` base class with HTTP status codes (400, 401, 403, 404, 409, 500)

### Database Patterns

- **Migration-driven**: Use Kysely migrations in `db/migrations/` with sequential numbering
- **ID encoding**: URLs use Base62 encoded IDs starting from 10000 for short codes (see `url.helper.ts`)
- **Dual URL types**: Generated short codes (`urls` table) vs custom codes (`custom_urls` table)
- **Schema namespacing**: All tables under `shortn.` schema
- **CamelCase conversion**: Database snake_case automatically converted to camelCase in TypeScript

### Authentication & Authorization

- **Dual auth mechanisms**: JWT cookies OR API key headers (`Authorization: Bearer <key>`)
- **Token types**: Access tokens (short-lived) and refresh tokens (cached in Redis)
- **Service account**: Special handling for `SERVICE_ACCOUNT_EMAIL` config with unlimited rate limits
- **Cookie management**: Signed cookies with `@fastify/cookie` for CSRF protection
- **Rate limiting**: User-based limits (1000/min for tokens, 5000/min for API keys, unlimited for service account)

### Caching Strategy (Redis)

- **Cache types**: `CacheType.REFRESH` for token management, `CacheType.URL` for URL resolution
- **Key patterns**: `{type}:{key}` format (e.g., `refresh:123`, `url:https://shortn.top/abc123`)
- **TTL management**: URLs cached for 24 hours, refresh tokens match JWT expiry
- **Cache invalidation**: Manual deletion on logout/account deletion, automatic expiry
- **Connection handling**: Auto-reconnect with error logging, graceful shutdown in app hooks

### Error Handling Patterns

- **Validation errors**: Zod validation failures return structured 400 responses with field-level details
- **Custom errors**: Domain-specific error classes (`AuthError`, `UrlError`, `CacheError`) with appropriate HTTP codes
- **Error formatting**: Consistent `{success: false, error: {message, details?}}` response structure
- **Error logging**: All errors logged with context, internal errors return generic messages to clients

### Rate Limiting Strategy

- **Dynamic limits**: Based on auth method (API key > access token > unauthenticated)
- **Key generation**: User ID for authenticated requests, IP for anonymous
- **Bypass patterns**: Service account unlimited, health endpoints unlimited
- **Time window**: 1-minute sliding window with `@fastify/rate-limit`

### SvelteKit 5 Patterns (apps/client/)

- **Runes system**: Use `$state`, `$derived`, `$effect` instead of old reactive declarations
- **Route protection**: Server-side auth checks in `+layout.server.ts` files
- **Route groups**: `(authenticated)` and `(unauthenticated)` layouts for auth state management
- **URL resolution**: Server-side redirects for shortened URLs using `+page.server.ts` load functions
- **Store patterns**: Writable stores with custom methods (see `auth.store.ts`)
- **API proxy**: Client-side API calls via server endpoints to hide API keys from client

### URL Encoding & Resolution

- **Base62 encoding**: Custom implementation in `url.helper.ts` with alphabet `0-9A-Za-z`
- **Custom URLs**: Prefixed with `/c/` segment, stored separately from generated codes
- **URL validation**: Protocol validation (HTTPS required), domain validation for shortened URLs
- **Resolution caching**: Original URLs cached in Redis with 24-hour TTL
- **ID decoding**: Reverse Base62 to lookup URLs in database by decoded ID

### Development Workflow

```bash
# Start full dev environment (PostgreSQL + Redis + API + Client)
docker compose -f docker-compose.dev.yml up

# Monorepo commands via Turbo
yarn dev          # Start all apps in dev mode
yarn build        # Build all packages
yarn check-types  # Type check all workspaces
yarn lint         # Lint all packages
```

### Environment Configuration

- **API config**: Structured config in `apps/api/lib/common/config.ts` with Zod validation
- **Client config**: Environment variables in `apps/client/src/lib/common/config.ts`
- **Service account**: Auto-generated email based on domain for local/production environments
- **CORS setup**: Dynamic allowed origins based on environment

### Deployment & CI/CD

- **Railway deployment**: Separate `railway.json` configs for API and client services
- **Docker multi-stage**: Development and production Dockerfiles with esbuild compilation
- **GitHub Actions**: Automated checks (types, lint), selective builds based on file changes
- **Health checks**: Required endpoints for Railway health monitoring
- **Environment management**: `.env.local.dev` for development, Railway environment variables for production

### Key File Locations

- **App entry**: `apps/api/lib/app.ts` - Plugin registration order matters for dependencies
- **DB setup**: `apps/api/lib/plugins/db.plugin.ts` - Kysely with connection pooling and graceful shutdown
- **Auth helpers**: `apps/api/lib/helpers/auth.helper.ts` - JWT generation, password hashing, API key management
- **Cache service**: `apps/api/lib/services/cache.service.ts` - Redis operations with automatic reconnection
- **Error handler**: `apps/api/lib/plugins/error-handler.plugin.ts` - Global error formatting and logging
- **Client layouts**: `apps/client/src/routes/+layout.svelte` - Global auth initialization and layout structure

## Common Tasks

### Add New API Endpoint

1. Create controller method in `lib/controllers/` with Zod schema
2. Register route in controller with appropriate auth middleware (`app.authenticate` or `app.authenticateSession`)
3. Implement business logic in service layer (`lib/services/`)
4. Add repository methods if database access needed (`lib/repositories/`)
5. Create custom error classes if needed (`lib/errors/`)

### Database Changes

1. Create numbered migration file in `db/migrations/` (e.g., `007_add-new-table.ts`)
2. Update type definitions if new tables/columns added
3. Modify repository methods to use new schema
4. Update service layer to handle new data patterns

### Authentication Features

- Follow `auth.controller.ts` patterns for token management
- Use `app.helpers.auth` for password hashing, token generation
- Implement proper cache invalidation for logout/account deletion
- Add appropriate rate limits for new endpoints

### Frontend Development

- Use SvelteKit 5 runes (`$state`, `$derived`, `$effect`) for reactivity
- Implement server-side auth checks in `+layout.server.ts` files
- Create API proxy endpoints in `routes/api/` to hide API keys
- Follow existing component patterns with TypeScript props interfaces
- Use Tailwind CSS classes consistently with existing design system
