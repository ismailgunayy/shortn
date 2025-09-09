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
			// TODO: Add "Please check our docs" once the docs are ready
			reply.code(404).send({
				success: false,
				error: {
					message: "No such endpoint :("
				}
			});
		}
	);
});
