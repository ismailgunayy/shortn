import { App } from "~/types/fastify";
import { createClient } from "redis";
import fastifyPlugin from "fastify-plugin";

export const cache = fastifyPlugin(async (app: App) => {
	const client = createClient({ url: app.config.REDIS_URL });

	client.on("error", (err) => {
		app.log.error(err, "Redis Client Error");
	});

	client.on("connect", () => {
		app.log.info("Redis Client Connected");
	});

	client.on("ready", () => {
		app.log.info("Redis Client Ready");
	});

	client.on("reconnecting", () => {
		app.log.info("Redis Client Reconnecting");
	});

	client.on("end", () => {
		app.log.info("Redis Client Disconnected");
	});

	app.addHook("onClose", (app) => {
		app.cache.destroy();
	});

	app.addHook("onError", (_req, _reply, _error, done) => {
		app.cache.destroy();
		done();
	});

	try {
		await client.connect();
	} catch (err) {
		app.log.error(err, "Redis Client Connection Error");
	}

	app.decorate("cache", client);
});
