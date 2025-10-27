<div align="left">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?logo=mit" alt="License" />
    <img src="https://img.shields.io/badge/Deployment-Railway-blueviolet" alt="Railway" />
    <img src="https://img.shields.io/badge/node-v24.10.0-44883e?logo=nodedotjs" alt="Node Version" />
</div>

# Shortn

A non-innovative URL Shortener

> ## **[🚀 Try it live now ](https://shortn.top)** | **[📚 API Documentation](https://docs.shortn.top)**

## Features

- **⚡ Instant URL Shortening**: Convert long URLs into short, shareable URLs
- **🚀 Fast Redirects**: Optimized for speed
- **🎨 Custom Short URLs**: Create your own custom aliases for URLs
- **👤 User Accounts**: Register to manage and track your shortened URLs
- **🔑 API Access**: Generate API keys for programmatic URL shortening

##### To be implemented:

- **📈 Analytics**: View click statistics for your URLs

## Tech Stack

#### Backend

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Fastify](https://fastify.dev/)** - High-performance HTTP framework
- **[Kysely](https://kysely.dev/)** - Type-safe SQL query builder
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Redis](https://redis.io/)** - Cache layer
- **[Zod](https://zod.dev/)** - Runtime type validation
- **[ESBuild](https://esbuild.github.io/)** - Build tool

#### Frontend

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[SvelteKit 5](https://kit.svelte.dev/)** - Full-stack framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Zod](https://zod.dev/)** - Runtime type validation
- **[Vite](https://vite.dev)** - Build tool

#### DevOps & Tooling

- **[TurboRepo](https://turbo.build/repo)** - Monorepo solution
- **[Docker](https://www.docker.com/)** - Containerization
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD
- **[Railway](https://railway.app)** - Deployment

## Quick Start with Docker

```bash

# Clone the repository
git clone https://github.com/ismailgunayy/shortn.git

# Navigate to the project directory
cd shortn

# Start all services with Docker
docker compose -f docker-compose.dev.yml up
```

## Contributing

Contributions are highly welcome! Feel free to open issues for bug reports or feature requests, and submit pull requests for improvements.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
