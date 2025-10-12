import { CustomCodeSchema, ShortenedUrlSchema, UrlSchema } from "~/schemas/url.schema";

import { ApiTags } from "~/plugins";
import { App } from "~/types/fastify";
import { createResponseSchema } from "~/schemas/api-response.schema";
import z from "zod";

export const UrlController = (app: App) => {
	app.post(
		"/url/shorten",
		{
			onRequest: [app.authenticate],
			schema: {
				description: "Shorten a given URL with an optional custom code",
				tags: [ApiTags.URL],
				body: z.object({
					url: z.string(),
					customCode: CustomCodeSchema.optional().or(z.literal(""))
				}),
				response: createResponseSchema(
					z.object({
						url: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { url, customCode } = request.body;
			const shortenedUrl = await app.services.url.shortenUrl(url, request.user.id, request.user.email, customCode);

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
			onRequest: [app.authenticate],
			schema: {
				description: "Get the original URL from a shortened URL",
				tags: [ApiTags.URL],
				body: z.object({
					url: ShortenedUrlSchema
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
			onRequest: [app.authenticate],
			schema: {
				description: "Get all URLs (shortened and custom) of the current user",
				tags: [ApiTags.URL],
				response: createResponseSchema(
					z.object({
						urls: z.array(
							z.object({
								id: z.number(),
								originalUrl: z.string(),
								shortenedUrl: z.string(),
								shortCode: z.string(),
								createdAt: z.date()
							})
						),
						customUrls: z.array(
							z.object({
								id: z.number(),
								originalUrl: z.string(),
								shortenedUrl: z.string(),
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

	app.post(
		"/url/:id",
		{
			onRequest: [app.authenticate],
			schema: {
				description: "Update the original URL of a custom URL by its ID",
				tags: [ApiTags.URL],
				params: z.object({
					id: z.string().pipe(z.coerce.number())
				}),
				body: z.object({
					originalUrl: UrlSchema
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						originalUrl: z.string(),
						shortenedUrl: z.string(),
						customCode: z.string(),
						createdAt: z.date()
					})
				)
			}
		},
		async (request, reply) => {
			const { id } = request.params;
			const { originalUrl } = request.body;

			const updatedUrl = await app.services.url.updateCustomUrl(id, request.user.id, originalUrl);

			return reply.code(200).send({
				success: true,
				data: {
					...updatedUrl
				}
			});
		}
	);

	app.delete(
		"/url/:id",
		{
			onRequest: [app.authenticate],
			schema: {
				description: "Delete a URL (shortened or custom) by its ID",
				tags: [ApiTags.URL],
				params: z.object({
					id: z.string().pipe(z.coerce.number())
				}),
				body: z.object({
					shortenedUrl: ShortenedUrlSchema
				}),
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			const { id } = request.params;
			const { shortenedUrl } = request.body;

			await app.services.url.deleteUrl(id, request.user.id, shortenedUrl);

			return reply.code(200).send({ success: true });
		}
	);
};
