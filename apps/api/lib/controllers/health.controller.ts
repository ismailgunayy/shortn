import { ApiTags } from "~/plugins";
import { App } from "~/types/fastify";
import z from "zod";

export const HealthController = (app: App) => {
	app.get(
		"/health",
		{
			schema: {
				description: "Health check endpoint to verify API status",
				tags: [ApiTags.HEALTH],
				response: {
					200: z.object({
						status: z.literal("OK")
					})
				}
			}
		},
		(_request, reply) => {
			reply.code(200).send({
				status: "OK"
			});
		}
	);
};
