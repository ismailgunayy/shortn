import { App } from "~/types/fastify";
import fastifyCors from "@fastify/cors";
import fastifyPlugin from "fastify-plugin";

export const cors = fastifyPlugin(async (app: App) => {
	await app.register(fastifyCors, {
		origin: true,
		methods: ["GET", "POST", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"]
	});
});
