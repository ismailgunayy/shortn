import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

export const notFound = fastifyPlugin((app: App) => {
	app.setNotFoundHandler(
		{
			preHandler: app.rateLimit({
				max: 23,
				timeWindow: 1000 * 60
			})
		},
		function (_request, reply) {
			reply.code(404).send({
				success: false,
				error: {
					message: `No such endpoint. Please check our docs at ${app.config.HTTP.DOCS_URL}`
				}
			});
		}
	);
});
