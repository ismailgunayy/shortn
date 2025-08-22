import { App } from "~/types/fastify";

export const gracefulShutdown = async (app: App) => {
	try {
		await app.close();

		app.log.info("Graceful shutdown complete");
		process.exit(0);
	} catch (error) {
		app.log.error({ error }, "Error during graceful shutdown");
		process.exit(1);
	}
};
