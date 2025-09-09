import { App } from "~/types/fastify";
import { createClient } from "redis";
import fastifyPlugin from "fastify-plugin";

export const cache = fastifyPlugin(async (app: App) => {
	const client = createClient({
		url: app.config.REDIS.URL,
		socket: {
			connectTimeout: 5000
		}
	});

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

	app.addHook("onClose", async (app) => {
		app.log.info("Closing Cache Client");
		try {
			await app.cache.quit();
		} catch (err) {
			app.log.error(err, "Error closing cache client");
		}
	});

	try {
		await client.connect();
	} catch (err) {
		app.log.error(err, "Cache Client Connection Error");
	}

	app.decorate("cache", client);
});
