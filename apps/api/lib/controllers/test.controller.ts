import { App } from "~/types/fastify";
import { createResponseSchema } from "~/schemas/api-response.schema";
import z from "zod";

export const TestController = (app: App) => {
	app.get(
		"/test",
		{
			onRequest: [app.authenticate],
			schema: {
				response: createResponseSchema(
					z.object({
						message: z.string()
					})
				)
			}
		},
		// eslint-disable-next-line require-await
		async (_request, reply) => {
			return reply.code(200).send({
				success: true,
				data: {
					message: "Hello from test endpoint!"
				}
			});
		}
	);
};
