import { auth, cors, db, rateLimit, services } from "./plugins";
import { disconnectDB, setupGracefulShutdown } from "./gracefulShutdown";

import { Config } from "./common/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import { log } from "./plugins/log";
import { mainRouter } from "./router";

const app = Fastify({
	logger: {
		timestamp: () => `,"time":"${new Date().toISOString()}"`
	}
});

app.decorate("config", Config);
app.register(log);
await app.register(helmet, {
	crossOriginEmbedderPolicy: false
});
await app.register(cors);
await app.register(db);
await app.register(rateLimit);
await app.register(auth);

await app.register(services);
await app.register(mainRouter, { prefix: "/api" });

const start = async () => {
	await app.listen({
		host: app.config.HOST,
		port: parseInt(app.config.PORT),
		listenTextResolver: () => `API is running on ${app.config.BASE_URL}`
	});
	app.log.info(app.server.address(), "Server internals:");
};

start().catch(async (err) => {
	app.log.error(err);
	await disconnectDB(app);
	process.exit(1);
});

setupGracefulShutdown(app);
