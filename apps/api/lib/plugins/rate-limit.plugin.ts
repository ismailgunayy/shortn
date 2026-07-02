import { App } from "~/types/fastify";
import { ShortnError } from "~/common/error";
import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

class RateLimitExceeded extends ShortnError {
	constructor(cause?: unknown) {
		super("Too many requests", 429, cause);
	}
}

export const rateLimit = fastifyPlugin(async (app: App) => {
	await app.register(fastifyRateLimit, {
		hook: "onRequest",
		global: true,
		max: (request) => {
			if (request.url === "/") {
				return Number.MAX_SAFE_INTEGER;
			}

			if (request.session?.user.isServiceAccount) {
				return Number.MAX_SAFE_INTEGER;
			}

			switch (request.session?.user.authenticatedWith) {
				case "apiKey":
					return 2500;

				case "accessToken":
					return 1000;

				default:
					return 15;
			}
		},
		timeWindow: 1000 * 60, // 1 minute,
		keyGenerator: (request) => {
			if (request.session?.user) {
				return `session-${request.session?.id}`;
			}

			return request.ip;
		},
		errorResponseBuilder: () => {
			return new RateLimitExceeded();
		}
	});
});
