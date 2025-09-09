import { App } from "~/types/fastify";
import { createClient } from "redis";
import fastifyPlugin from "fastify-plugin";

export const cache = fastifyPlugin(async (app: App) => {
	const client = createClient({ url: app.config.REDIS.URL });

	client.on("error", (err) => {
		app.log.error(err, "Cache Client Error");
	});

	client.on("connect", () => {
		app.log.info("Cache Client Connected");
	});

	client.on("ready", () => {
		app.log.info("Cache Client Ready");
	});

	client.on("reconnecting", () => {
		app.log.info("Cache Client Reconnecting");
	});

	client.on("end", () => {
		app.log.info("Cache Client Disconnected");
	});

	app.addHook("onClose", (app) => {
		app.log.error("Cache Client Closed");
		app.cache.destroy();
	});

	app.addHook("onError", (_req, _reply, error, done) => {
		app.log.error(error);
		app.cache.destroy();
		done();
	});

	try {
		await client.connect();
	} catch (err) {
		app.log.error(err, "Cache Client Connection Error");
	}

	app.decorate("cache", client);
});
