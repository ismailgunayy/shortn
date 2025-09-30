<div align="left">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?logo=mit" alt="License" />
    <img src="https://img.shields.io/badge/Deployment-Railway-blueviolet" alt="Railway" />
    <img src="https://img.shields.io/badge/node-v24-44883e?logo=nodedotjs" alt="Node Version" />
</div>

# Shortn

A non-innovative URL Shortener

> ## **[🚀 Try it live now ](https://shortn.top)**

## Features

- **Instant URL Shortening**: Convert long URLs into short, shareable URLs
- **Fast Redirects**: Optimized for speed
- **Custom Short URLs**: Your custom aliases for URLs
- **User Accounts**: Register to manage and track your shortened URLs
- **API Access**: Generate API keys for programmatic URL shortening

##### To be implemented:

- **Analytics**: View click statistics for your URLs

## Tech Stack

### Backend

- **[Fastify](https://fastify.dev/)** - HTTP framework
- **[Kysely](https://kysely.dev/)** - Type-safe SQL query builder
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Redis](https://redis.io/)** - Cache layer
- **[Zod](https://zod.dev/)** - Runtime type/schema validation
- **[ESBuild](https://esbuild.github.io/)** - Build tool

### Frontend

- **[SvelteKit 5](https://kit.svelte.dev/)** - Full-stack framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Vite](https://vite.dev)** - Build tool

### DevOps & Tooling

- **[TurboRepo](https://turbo.build/repo)** - Monorepo solution
- **[Docker](https://www.docker.com/)** - Containerization
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD
- **[Railway](https://railway.app)** - Deployment

## Quick Start with Docker

```bash
# Start all services with Docker
docker compose -f docker-compose.dev.yml up
```

Then, go to http://localhost:3024

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
