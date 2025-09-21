import { App } from "~/types/fastify";
import { createResponseSchema } from "~/schemas/api-response.schema";
import z from "zod";

export const UrlController = (app: App) => {
	app.post(
		"/url/shorten",
		{
			preHandler: [app.authenticate],
			schema: {
				body: z.object({
					url: z.url(),
					customCode: z.string().optional()
				}),
				response: createResponseSchema(
					z.object({
						url: z.url()
					})
				)
			}
		},
		async (request, reply) => {
			const { url, customCode } = request.body;
			const shortenedUrl = await app.services.url.shortenUrl(url, request.user.id, customCode);

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
			preHandler: [app.authenticate],
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

	app.get(
		"/url",
		{
			preHandler: [app.authenticate],
			schema: {
				response: createResponseSchema(
					z.object({
						urls: z.array(
							z.object({
								id: z.number(),
								originalUrl: z.string(),
								shortCode: z.string(),
								createdAt: z.date()
							})
						),
						customUrls: z.array(
							z.object({
								id: z.number(),
								originalUrl: z.string(),
								customCode: z.string(),
								createdAt: z.date()
							})
						)
					})
				)
			}
		},
		async (request, reply) => {
			const allUrls = await app.services.url.getUrlsOfUser(request.user.id);

			return reply.code(200).send({
				success: true,
				data: {
					urls: allUrls.urls,
					customUrls: allUrls.customUrls
				}
			});
		}
	);

	app.delete(
		"/url/:id",
		{
			preHandler: [app.authenticate],
			schema: {
				params: z.object({
					id: z.number()
				}),
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			const { id } = request.params;
			await app.services.url.deleteUrl(id, request.user.id);

			return reply.code(200).send({ success: true });
		}
	);
};
