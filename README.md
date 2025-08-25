<div align="left">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?logo=mit" alt="License" />
    <img src="https://img.shields.io/badge/Deployment-Railway-blueviolet" alt="Railway" />
    <img src="https://img.shields.io/badge/node-v24.0.2-44883e?logo=nodedotjs" alt="Node Version" />
</div>

# Shortn

A non-innovative URL shortener

> ## **[🚀 Try it live now ](https://shortn.up.railway.app)**

### Features

- Fast URL shortening with Base62 encoding
- Redis caching for quick retrieval
- Clean, responsive interface
- JWT-based authentication

### Tech Stack

##### Frontend

- [Svelte 5](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vite.dev)

##### Backend

- [Node.js](https://nodejs.org/)
- [Fastify](https://fastify.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Kysely](https://kysely.dev/)
- [ESBuild](https://esbuild.github.io/)

##### Tooling

- [TurboRepo](https://turbo.build/repo)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Docker](https://www.docker.com/)
- Deployed to [Railway](https://railway.app) via [GitHub Actions](https://github.com/features/actions)

### Running locally

```bash
docker compose -f docker-compose.dev.yml up
```

Go to [http://localhost:3024](http://localhost:3024)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
