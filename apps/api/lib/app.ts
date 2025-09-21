import { auth, cors, db, error, helmet, helpers, log, notFound, rateLimit, router, services } from "./plugins";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { APP_CONFIG } from "./common/config";
import Fastify from "fastify";
import { gracefulShutdown } from "./graceful-shutdown";

const app = Fastify({
	logger: {
		timestamp: () => `,"time":"${new Date().toISOString()}"`
	}
});

app.decorate("config", APP_CONFIG);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(log);
await app.register(error);
await app.register(helmet);
await app.register(db);
await app.register(auth);
await app.register(rateLimit);
await app.register(notFound);
await app.register(cors);
await app.register(helpers);
await app.register(services);
await app.register(router);

const start = async () => {
	await app.listen({
		host: app.config.HTTP.HOST,
		port: app.config.HTTP.PORT,
		listenTextResolver: () => `API is running on ${app.config.HTTP.BASE_URL}`
	});
	app.log.info(app.server.address());
};

start().catch((err) => {
	app.log.error(err);
	process.exit(1);
});

(["SIGINT", "SIGTERM"] as NodeJS.Signals[]).forEach((signal) => process.on(signal, () => gracefulShutdown(app)));
