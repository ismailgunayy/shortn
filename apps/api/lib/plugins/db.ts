import { Kysely, PostgresDialect } from "kysely";

import { DB } from "~/types/db-schema";
import { Pool } from "pg";
import fastifyPlugin from "fastify-plugin";

export const db = fastifyPlugin((app) => {
	const pool = new Pool({
		connectionString: app.config.DATABASE_URL,
		max: 10
	});

	const db = new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: pool
		})
	});

	db.pool = pool;
	app.decorate("db", db);
});
