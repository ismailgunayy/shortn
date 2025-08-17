import { auth, cors, db, helpers, rateLimit, services } from "./plugins";
import { disconnectDB, setupGracefulShutdown } from "./gracefulShutdown";

import { Config } from "./common/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import { mainRouter } from "./router";

const app = Fastify({
	logger: {
		timestamp: () => `,"time":"${new Date().toISOString()}"`
	}
});

app.decorate("config", Config);
await app.register(helmet, {
	crossOriginEmbedderPolicy: false
});
await app.register(cors);
await app.register(db);
await app.register(rateLimit);
await app.register(auth);

await app.register(helpers);
await app.register(services);
await app.register(mainRouter);

const start = async () => {
	await app.listen({ port: parseInt(app.config.PORT) });
};

start().catch(async (err) => {
	app.log.error(err);
	await disconnectDB(app);
	process.exit(1);
});

setupGracefulShutdown(app);
