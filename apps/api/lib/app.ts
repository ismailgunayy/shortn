import * as plugins from "./plugins";

import { fastifyZodOpenApiPlugin, serializerCompiler, validatorCompiler } from "fastify-zod-openapi";

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

await app.register(fastifyZodOpenApiPlugin);

await app.register(plugins.log);
await app.register(plugins.error);
await app.register(plugins.helmet);
await app.register(plugins.db);
await app.register(plugins.auth);
await app.register(plugins.rateLimit);
await app.register(plugins.notFound);
await app.register(plugins.cors);
await app.register(plugins.helpers);
await app.register(plugins.services);
await app.register(plugins.docs);
await app.register(plugins.router);

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
