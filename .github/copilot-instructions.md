# Copilot Instructions for Shortn

## Project Overview

Shortn is a URL shortener built as a TurboRepo monorepo with:

- **API**: Fastify server with TypeScript, PostgreSQL, Redis caching
- **Client**: SvelteKit 5 frontend with Tailwind CSS
- **Database**: Kysely type-safe query builder with PostgreSQL
- **Infrastructure**: Docker containerization, Railway deployment

## Architecture Patterns

### Fastify Plugin System

The API uses a structured plugin registration order in `apps/api/lib/app.ts`:

```typescript
// Critical order: log → error → helmet → db → auth → rate-limit → etc.
await app.register(log);
await app.register(error);
await app.register(db); // Must come before services that need DB
```

**Key principle**: Plugins that depend on others (like services needing DB) must register after their dependencies.

### Service/Repository Pattern

- **Controllers** (`lib/controllers/`) handle HTTP requests with Zod validation
- **Services** (`lib/services/`) contain business logic
- **Repositories** (`lib/repositories/`) handle database operations
- **Plugins** (`lib/plugins/`) extend Fastify with cross-cutting concerns

### Database Schema & Migrations

- Uses Kysely with CamelCasePlugin for automatic snake_case ↔ camelCase conversion
- Migration files in `apps/api/db/migrations/` numbered sequentially (001*, 002*, etc.)
- Schema namespace: `shortn.table_name` (see migrations for examples)
- ID sequences start from 10000 for short codes

## Development Workflows

### Local Development

```bash
# Full stack with Docker (recommended)
docker compose -f docker-compose.dev.yml up

# Individual services
yarn dev:api    # API on localhost:3124
yarn dev:client # Client on localhost:3024

# Database operations
yarn db:migrate      # Run latest migrations
yarn db:generate     # Generate types from schema
```

### Key Ports & Services

- API: 3124 (dev), 3124 (docker)
- Client: 3024 (dev), 3024 (docker)
- PostgreSQL: 5433 (docker)
- Redis: 6381 (docker)

### TurboRepo Commands

- `yarn dev` - Start all apps in development
- `yarn build` - Build all packages
- `yarn lint` - Lint all packages
- Use `--filter api` or `--filter client` to target specific apps

## Code Conventions

### API Response Schema

All endpoints use `createResponseSchema()` from `~/schemas/api-response.schema.ts`:

```typescript
schema: {
	response: createResponseSchema(
		z.object({ url: z.string() }) // Success data shape
	);
}
// Generates: { 200: SuccessSchema, 400: ErrorSchema, 401: ErrorSchema, 500: ErrorSchema }
```

### Authentication & Authorization

- JWT-based auth with `app.authenticate` preHandler
- User data available as `request.user` after authentication
- API key system for programmatic access (in development)

### Error Handling

- Custom error classes in `lib/errors/` extending `BaseError`
- Centralized error handling plugin converts errors to API responses
- Type-safe error responses with consistent structure

### Database Patterns

- Use `app.db` for Kysely instance (decorated on Fastify)
- Separate pool management for graceful shutdown
- CamelCase plugin handles field naming conversion automatically

### Type Safety

- Strict TypeScript with `fastify-type-provider-zod`
- Generated DB types with `kysely-codegen`
- Path aliases: `~` maps to `apps/api/lib/`

## File Organization

### Critical Directories

- `apps/api/lib/controllers/` - HTTP route handlers
- `apps/api/lib/services/` - Business logic layer
- `apps/api/lib/plugins/` - Fastify plugins (auth, db, etc.)
- `apps/api/lib/schemas/` - Zod validation schemas
- `apps/api/db/migrations/` - Database migration files
- `apps/client/src/routes/` - SvelteKit pages and API routes

### Environment & Config

- Environment-specific Docker Compose files: `docker-compose.dev.yml`, `docker-compose.prod.yml`
- Configuration centralized in `apps/api/lib/common/config.ts`
- Environment files: `.env.local.dev`, `.env.local.prod`

## Integration Points

### Database Integration

- Kysely migrations with `yarn db:migrate`
- Type generation with `yarn db:generate`
- Connection pooling handled by DB plugin

### Caching Layer

- Redis integration via `cache.service.ts`
- Used for URL lookup optimization and rate limiting

### Client-API Communication

- API base URL configuration in client
- Shared Zod schemas for type safety across boundaries
- RESTful API design with consistent response format

## Testing & Debugging

### API Testing

- Bruno collections in `bruno/` directory
- Environment-specific configs: `bruno/environments/`
- Organized by feature: `bruno/auth/`, `bruno/url/`

### Database Debugging

- Use `yarn db:migrate` to apply schema changes
- Check migration history in database
- Monitor connection pools during development

When working on this codebase, prioritize type safety, follow the established plugin patterns, and maintain the service/repository separation for clean architecture.
