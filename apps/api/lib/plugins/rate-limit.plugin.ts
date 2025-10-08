import { App } from "~/types/fastify";
import { AuthMethod } from "~/services/auth.service";
import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

export const rateLimit = fastifyPlugin(async (app: App) => {
	await app.register(fastifyRateLimit, {
		hook: "onRequest",
		global: true,
		max: (request) => {
			if (request.url === "/") {
				return Number.MAX_SAFE_INTEGER;
			}

			if (request.user?.isServiceAccount) {
				return Number.MAX_SAFE_INTEGER;
			}

			switch (request.user?.authenticatedWith) {
				case AuthMethod.API_KEY:
					return 5000;

				case AuthMethod.ACCESS_TOKEN:
					return 1000;

				default:
					return 1000;
			}
		},
		timeWindow: 1000 * 60, // 1 minute,
		keyGenerator: (request) => {
			if (request.user) {
				return `user-${request.user.id}`;
			}

			return request.ip;
		}
	});
});
