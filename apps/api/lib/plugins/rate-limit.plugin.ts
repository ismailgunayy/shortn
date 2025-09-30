import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

export const rateLimit = fastifyPlugin(async (app: App) => {
	await app.register(fastifyRateLimit, {
		hook: "onRequest",
		global: true,
		max: 1000,
		timeWindow: 1000 * 60, // 1 minute,
		allowList: (request) => {
			return Boolean(request.user?.isServiceAccount);
		},
		keyGenerator: (request) => {
			if (request.user) {
				return `user-${request.user.id}`;
			}

			return request.ip;
		}
	});
});
