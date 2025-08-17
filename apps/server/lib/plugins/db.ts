import { Kysely, PostgresDialect } from "kysely";

import { DB } from "~/types/db-schema";
import { Pool } from "pg";
import fastifyPlugin from "fastify-plugin";

export const db = fastifyPlugin((app) => {
	const db = new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: new Pool({
				connectionString: app.config.db.DATABASE_URL,
				max: 10
			})
		})
	});

	app.decorate("db", db);
});
