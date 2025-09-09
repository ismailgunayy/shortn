import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";

import { App } from "~/types/fastify";
import { DB } from "~/types/db";
import { Pool } from "pg";
import fastifyPlugin from "fastify-plugin";

const disconnectDB = async (app: App) => {
	const maxWaitTime = 10000;
	const checkInterval = 200;
	let waitTime = 0;

	while (waitTime < maxWaitTime) {
		const activeConnections = app.db.pool.totalCount - app.db.pool.idleCount;

		if (activeConnections === 0) {
			app.log.info("All database connections closed.");
			break;
		}

		app.log.debug(`Waiting for ${activeConnections} active database connections...`);
		await new Promise((resolve) => setTimeout(resolve, checkInterval));
		waitTime += checkInterval;
	}

	app.log.warn("Disconnecting Database...");
	await app.db.pool.end();
};

export const db = fastifyPlugin((app: App) => {
	const pool = new Pool({
		connectionString: app.config.DATABASE.URL,
		max: 10
	});

	const db = new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: pool
		}),
		plugins: [new CamelCasePlugin()]
	});

	db.pool = pool;

	app.addHook("onClose", async (app) => {
		await disconnectDB(app);
	});

	app.addHook("onError", (_req, _reply, error, done) => {
		app.log.error(error, "DB connection error occurred");

		done();
	});

	app.log.info("Database connection established");
	app.decorate("db", db);
});
