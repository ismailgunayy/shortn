import { createClient } from "redis";
import fastifyPlugin from "fastify-plugin";

export const cache = fastifyPlugin(async (app) => {
	const client = createClient({ url: app.config.REDIS_URL });
	await client.connect();

	app.decorate("cache", client);
});
