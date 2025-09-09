import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";
import fs from "node:fs/promises";
import path from "node:path";

const MIGRATION_FOLDER = "db/migrations";

export default defineConfig({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL
		})
	}),
	migrations: {
		async getMigrationPrefix() {
			const files = await fs.readdir(path.join(__dirname, MIGRATION_FOLDER));

			return `${(files.length + 1).toString().padStart(3, "0")}_`;
		},
		migrationFolder: path.join(__dirname, MIGRATION_FOLDER)
	}
});
