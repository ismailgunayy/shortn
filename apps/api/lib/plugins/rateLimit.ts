import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

export const rateLimit = fastifyPlugin(async (app: App) => {
	await app.register(fastifyRateLimit, {
		global: true,
		max: 100,
		timeWindow: 1000 * 60
	});

	app.setNotFoundHandler(
		{
			preHandler: app.rateLimit({
				max: 4,
				timeWindow: 1000 * 60
			})
		},
		function (_request, reply) {
			// TODO: Add "Please check our docs" once implemented:
			reply.code(404).send({ error: "No such endpoint :(" });
		}
	);
});
