import { App } from "~/types/fastify";
import { createResponseSchema } from "~/schemas/api-response.schema";
import z from "zod";

export const UrlController = (app: App) => {
	app.post(
		"/url/shorten",
		{
			schema: {
				body: z.object({
					url: z.url()
				}),
				response: createResponseSchema(
					z.object({
						url: z.url()
					})
				)
			}
		},
		async (request, reply) => {
			const { url } = request.body;
			const shortenedUrl = await app.services.url.shortenUrl(url);

			return reply.code(200).send({
				success: true,
				data: {
					url: shortenedUrl
				}
			});
		}
	);

	app.post(
		"/url/original",
		{
			schema: {
				body: z.object({
					url: z.string()
				}),
				response: createResponseSchema(
					z.object({
						url: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { url: shortenedUrl } = request.body;
			const originalUrl = await app.services.url.getOriginalUrl(shortenedUrl);

			return reply.code(200).send({
				success: true,
				data: { url: originalUrl }
			});
		}
	);
};
