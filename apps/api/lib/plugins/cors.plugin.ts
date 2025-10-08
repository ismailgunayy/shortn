import { App } from "~/types/fastify";
import fastifyCors from "@fastify/cors";
import fastifyPlugin from "fastify-plugin";

export const cors = fastifyPlugin(async (app: App) => {
	await app.register(fastifyCors, {
		origin: [app.config.HTTP.CLIENT_URL, app.config.HTTP.DOCS_URL, ...app.config.HTTP.ALLOWED_ORIGINS],
		credentials: true,
		methods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"]
	});
});
