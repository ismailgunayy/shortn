# Production Dockerfile for Client (SvelteKit)
FROM node:24.0.2-alpine AS base

# Dependencies stage - install all dependencies for building
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files for workspace
COPY package.json yarn.lock turbo.json ./

# Copy workspace packages
COPY packages/ packages/

# Copy client package.json
COPY apps/client/package.json apps/client/

# Install all dependencies (including devDependencies needed for build and runtime)
RUN yarn install --frozen-lockfile

# Build stage - build SvelteKit application
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy client source code
COPY apps/client/ apps/client/

# Copy root files
COPY package.json yarn.lock turbo.json ./

WORKDIR /app/apps/client

# Build arguments for environment variables - Railway will inject these
ARG VITE_CLIENT_HOST
ARG VITE_API_BASE_URL
ARG VITE_API_BASE_URL_SERVER
ARG VITE_PORT

# Set environment variables for build
ENV VITE_CLIENT_HOST=$VITE_CLIENT_HOST
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE_URL_SERVER=$VITE_API_BASE_URL_SERVER
ENV VITE_PORT=$VITE_PORT

# Build the SvelteKit application
RUN yarn build

# Production stage - runtime with minimal dependencies
FROM base AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 clientuser

# Copy root workspace files
COPY package.json yarn.lock turbo.json ./
COPY packages/ packages/

# Copy client package.json
COPY apps/client/package.json apps/client/

# Copy the entire built application (needed for vite preview)
COPY --from=builder --chown=clientuser:nodejs /app/apps/client ./apps/client

# Remove node_modules (we'll install production deps)
RUN rm -rf ./apps/client/node_modules

# Install all dependencies (vite and @sveltejs/vite-plugin-svelte are needed for preview)
RUN yarn install --frozen-lockfile && \
	yarn cache clean --force

# Change ownership
RUN chown -R clientuser:nodejs /app

USER clientuser

# Expose port
EXPOSE 3023

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:$VITE_PORT || exit 1

# Start the SvelteKit preview server
CMD ["yarn", "workspace", "client", "start"]
