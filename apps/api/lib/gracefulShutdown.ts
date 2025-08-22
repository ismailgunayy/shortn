import { App } from "~/types/fastify";

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

export const gracefulShutdown = async (app: App) => {
	try {
		await app.close();

		await disconnectDB(app);
		app.cache.destroy();

		app.log.info("Graceful shutdown complete");
		process.exit(0);
	} catch (error) {
		app.log.error({ error }, "Error during graceful shutdown");
		process.exit(1);
	}
};
