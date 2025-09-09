import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

export const rateLimit = fastifyPlugin(async (app: App) => {
	await app.register(fastifyRateLimit, {
		hook: "preHandler",
		global: true,
		max: 1000,
		timeWindow: 1000 * 60, // 1 minute,
		keyGenerator: (request) => {
			if (request.user) {
				return `user-${request.user.id}`;
			} else if (request.headers["x-api-key"]) {
				return `api-key-${request.headers["x-api-key"]}`;
			}

			return request.ip;
		}
	});
});
