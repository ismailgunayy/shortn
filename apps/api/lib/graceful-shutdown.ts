import { App } from "~/types/fastify";

export const gracefulShutdown = async (app: App) => {
	try {
		await app.close();
		app.log.info("Graceful shutdown complete");
		process.exit(0);
	} catch (err) {
		app.log.error(err, "Error during graceful shutdown");
		process.exit(1);
	}
};
