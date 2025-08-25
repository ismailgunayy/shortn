import { auth, cache, cors, db, log, notFound, rateLimit, services } from "./plugins";

import { Config } from "./common/config";
import Fastify from "fastify";
import { gracefulShutdown } from "./gracefulShutdown";
import helmet from "@fastify/helmet";
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
await app.register(cache);
await app.register(rateLimit);
await app.register(notFound);
await app.register(auth);

await app.register(services);
await app.register(mainRouter, { prefix: "/api" });

const start = async () => {
	await app.listen({
		host: app.config.HOST,
		port: parseInt(app.config.PORT),
		listenTextResolver: () => `API is running on ${app.config.BASE_URL}`
	});
	app.log.info(app.server.address());
};

start().catch((err) => {
	app.log.error(err);
	process.exit(1);
});

(["SIGINT", "SIGTERM"] as NodeJS.Signals[]).forEach((signal) => process.on(signal, () => gracefulShutdown(app)));
