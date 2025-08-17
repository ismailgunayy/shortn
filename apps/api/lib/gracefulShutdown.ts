import { App } from "~/types/fastify";

export const disconnectDB = async (app: App) => {
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

export const setupGracefulShutdown = (app: App) => {
	const gracefulShutdown = async (signal: NodeJS.Signals) => {
		app.log.info(`Received ${signal}. Shutting down gracefully...`);

		try {
			await app.close();

			await disconnectDB(app);

			app.log.info("Graceful shutdown complete");
			process.exit(0);
		} catch (error) {
			app.log.error({ signal, error }, "Error during graceful shutdown");
			process.exit(1);
		}
	};

	(["SIGINT", "SIGTERM"] as NodeJS.Signals[]).forEach((signal) => process.on(signal, gracefulShutdown));

	process.on("uncaughtException", (error) => {
		app.log.error(error, "Uncaught Exception:");
		process.exit(1);
	});

	process.on("unhandledRejection", (reason, promise) => {
		app.log.error({ promise, reason }, "Unhandled Rejection at:");
		process.exit(1);
	});
};
