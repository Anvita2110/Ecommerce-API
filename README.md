# Ecommerce API

Express + Bun ecommerce backend with Prisma (PostgreSQL), JWT auth, Redis rate limiting, and Biome checks.

## Tech Stack

- Bun runtime
- Express 5
- Prisma ORM + PostgreSQL
- JWT auth (cookie + bearer token support)
- Redis-backed rate limiter
- Biome (format/lint) + GitHub Actions CI

## Prerequisites

- Bun
- PostgreSQL
- Redis (optional locally; required for distributed rate limiting)

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
PORT=3000

# Redis
REDIS_URL="redis://localhost:6379"
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW_SECONDS=60
```

For Upstash, use TLS:

```env
REDIS_URL="rediss://<username>:<password>@<host>:6379"
```

## Local Development

Install dependencies:

```bash
bun install
```

Run the app:

```bash
bun run dev
```

## Database (Prisma)

Generate Prisma client:

```bash
bunx prisma generate
```

Run migrations:

```bash
bunx prisma migrate dev
```

## Docker (Postgres + Redis)

Start local services:

```bash
docker compose up -d
```

## Scripts

- `bun run dev` - run server with watch mode
- `bun run build` - bundle app to `dist/`
- `bun run start` - start built app (`dist/index.js`)
- `bun run format` - format files (write)
- `bun run lint` - lint files (write)
- `bun run format:check` - formatting check for CI
- `bun run lint:check` - lint check for CI
- `bun run types:check` - TypeScript check

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes/PRs:

- format check
- lint check
- type check
