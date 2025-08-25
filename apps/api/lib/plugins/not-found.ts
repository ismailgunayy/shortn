import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

export const notFound = fastifyPlugin((app: App) => {
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
