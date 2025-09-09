# Shortn - GitHub Copilot Instructions

## Project Overview

A URL shortener service built with a TypeScript monorepo using TurboRepo. The API uses Fastify with PostgreSQL/Redis, and the client uses SvelteKit 5 with Tailwind CSS.

## Architecture & Patterns

### Monorepo Structure

- **Root**: TurboRepo configuration with shared packages (`eslint-config`, `typescript-config`)
- **`apps/api`**: Fastify API server with layered architecture
- **`apps/client`**: SvelteKit 5 frontend with server-side redirect handling
- **`packages/`**: Shared configuration packages

### API Architecture (Fastify Plugin System)

- **Plugins**: All functionality is modularized as Fastify plugins in `apps/api/lib/plugins/`
- **Controllers**: Route handlers using Zod for validation (`apps/api/lib/controllers/`)
- **Services**: Business logic layer with dependency injection (`apps/api/lib/services/`)
- **Repositories**: Data access layer using Kysely ORM (`apps/api/lib/repositories/`)

### Key Patterns

- **Configuration**: Environment variables validated with Zod in `apps/api/lib/common/config.ts`
- **Database**: Kysely with CamelCase plugin, schema generated in `types/db.d.ts`
- **Authentication**: JWT with refresh tokens, `preHandler` hooks for protected routes
- **URL Encoding**: Base62 encoding in `helpers/base62.helper.ts` for short codes
- **Error Handling**: Custom error classes extending base Error class
- **Caching**: Redis integration for URL lookups with TTL

## Development Workflows

### Essential Commands

```bash
# Development with Docker (recommended)
docker compose -f docker-compose.dev.yml up

# Individual app development
turbo dev --filter api    # API only
turbo dev --filter client # Client only

# Database operations
yarn db:migrate           # Run Kysely migrations
yarn db:generate         # Generate TypeScript types
```

### Build System

- **API**: ESBuild with external Fastify dependencies (`apps/api/esbuild.mjs`)
- **Client**: Vite with SvelteKit adapter
- **Shared**: TurboRepo cache with dependency-based task ordering

## Client-Side Patterns

### SvelteKit 5 Specifics

- **State Management**: Uses new `$state()` and `$derived()` runes
- **Server Routes**: `[slug]/+page.server.ts` handles redirects server-side
- **API Integration**: Centralized service in `src/lib/services/api.ts` with retry logic

### URL Resolution Flow

1. Client visits `/{slug}`
2. `+page.server.ts` calls API to resolve original URL
3. Server-side redirect (302) to original URL
4. API checks Redis cache first, then PostgreSQL

## Database Schema

Tables use `shortn.` prefix:

- `shortn.urls`: ID auto-increment, URL storage
- `shortn.users`: Authentication with bcrypt passwords
- `shortn.apiKeys`: API key management

## Key Integration Points

- **CORS**: Configured for specific client URL in production
- **Rate Limiting**: Applied globally via Fastify plugin
- **Health Checks**: Docker compose health checks for all services
- **Deployment**: Railway with GitHub Actions, environment-specific configs

## Common Gotchas

- Database connections must be properly closed in `onClose` hooks
- Redis cache errors are logged but don't break URL shortening
- Client-side API service handles 401 retries with token refresh
- Base62 encoding/decoding handles edge cases (0, negative numbers)
- Environment validation fails fast on startup with descriptive errors
