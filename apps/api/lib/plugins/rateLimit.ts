import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

export const rateLimit = fastifyPlugin(async (app: App) => {
	await app.register(fastifyRateLimit, {
		global: true,
		max: 100,
		timeWindow: 1000 * 60, // 1 minute
		keyGenerator(req) {
			const auth = req.headers.authorization;

			if (auth && auth.startsWith("Bearer ")) {
				return auth.slice(7);
			}

			return req.ip;
		}
	});
});
