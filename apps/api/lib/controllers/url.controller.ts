import { InvalidShortenedURL, InvalidURL } from "~/errors/url.error";

import { App } from "~/types/fastify";
import { Type as T } from "@sinclair/typebox";
import { createResponseSchema } from "~/types/api";

const BodySchema = T.Object({
	url: T.String()
});

const ShortenResponseSchema = createResponseSchema(
	T.Object({
		url: T.String()
	})
);

const OriginalResponseSchema = createResponseSchema(
	T.Object({
		url: T.String()
	})
);

export const URLController = (app: App) => {
	app.post(
		"/shorten",
		{
			preHandler: [app.authenticate],
			schema: {
				body: BodySchema,
				response: ShortenResponseSchema
			}
		},
		async (request, reply) => {
			try {
				const { url } = request.body;
				const shortenedUrl = await app.services.url.shortenUrl(url);

				return reply.code(200).send({ success: true, data: { url: shortenedUrl } });
			} catch (error) {
				if (error instanceof InvalidURL) {
					app.log.error(error, error.message);

					return reply.code(400).send({
						success: false,
						error: error.message
					});
				} else {
					app.log.error(error, "Internal Server Error");

					return reply.code(500).send({
						success: false,
						error: "Internal Server Error"
					});
				}
			}
		}
	);

	app.post(
		"/original",
		{
			preHandler: [app.authenticate],
			schema: {
				body: BodySchema,
				response: OriginalResponseSchema
			}
		},
		async (request, reply) => {
			try {
				const { url: shortenedUrl } = request.body;
				const originalUrl = await app.services.url.getOriginalUrl(shortenedUrl);

				return reply.code(200).send({
					success: true,
					data: { url: originalUrl }
				});
			} catch (error) {
				if (error instanceof InvalidShortenedURL) {
					app.log.error(error, error.message);

					return reply.code(400).send({
						success: false,
						error: error.message
					});
				} else {
					app.log.error(error, "Internal Server Error");

					return reply.code(500).send({
						success: false,
						error: "Internal Server Error"
					});
				}
			}
		}
	);
};
