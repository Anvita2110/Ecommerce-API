// Load .env before env("DATABASE_URL") is resolved (Prisma does not auto-load .env for this config).
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
	process.env.DATABASE_URL ??
	"postgresql://postgres:postgres@localhost:5432/postgres?schema=public";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: databaseUrl,
	},
});
