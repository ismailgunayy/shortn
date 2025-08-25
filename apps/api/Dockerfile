# Production Dockerfile for API (Fastify)
FROM node:24.0.2-alpine AS base

# Dependencies stage - install all dependencies for building
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files for workspace
COPY package.json yarn.lock turbo.json ./

# Copy workspace packages
COPY packages/ packages/

# Copy API package.json
COPY apps/api/package.json apps/api/

# Install all dependencies (including devDependencies needed for build)
RUN yarn install --frozen-lockfile

# Build stage - compile TypeScript to JavaScript
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy API source code
COPY apps/api/ apps/api/

# Copy root files
COPY package.json yarn.lock turbo.json ./

WORKDIR /app/apps/api

# Build the application using esbuild
RUN yarn build

# Production stage - only runtime dependencies
FROM base AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app


ARG NODE_ENV
ARG APP_ENV
ARG HOST
ARG BASE_URL
ARG CLIENT_URL
ARG PORT
ARG JWT_SECRET
ARG JWT_EXPIRES_IN
ARG DATABASE_URL
ARG REDIS_URL

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy root workspace files
COPY package.json yarn.lock turbo.json ./
COPY packages/ packages/

# Copy API package.json and built application
COPY apps/api/package.json apps/api/
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./apps/api/dist

# Copy migrations for database setup
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/migrations ./apps/api/migrations
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/kysely.config.ts ./apps/api/kysely.config.ts

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && \
	yarn cache clean --force

# Change ownership of the entire app directory
RUN chown -R apiuser:nodejs /app

USER apiuser


# Set environment variables from build args
ENV NODE_ENV=$NODE_ENV
ENV APP_ENV=$APP_ENV
ENV HOST=$HOST
ENV BASE_URL=$BASE_URL
ENV CLIENT_URL=$CLIENT_URL
ENV PORT=$PORT
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL

# Add healthcheck
HEALTHCHECK --interval=2s --timeout=3s --start-period=10s --retries=5 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/health || exit 1

# Create and use a simple startup script
WORKDIR /app/apps/api
CMD ["sh", "-c", "echo 'Running database migrations...' && (yarn db:migrate || (echo 'Migration failed with error:' && yarn db:migrate 2>&1)) && echo 'Starting API server...' && yarn start"]
