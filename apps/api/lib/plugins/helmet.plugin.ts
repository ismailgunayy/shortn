import { App } from "~/types/fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyPlugin from "fastify-plugin";

export const helmet = fastifyPlugin(async (app: App) => {
	await app.register(fastifyHelmet, {
		crossOriginEmbedderPolicy: false
	});
});
