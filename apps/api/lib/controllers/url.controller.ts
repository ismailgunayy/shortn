import { InvalidShortenedURL, InvalidURL } from "~/errors/url.error";

import { App } from "~/types/fastify";
import { Type as T } from "@sinclair/typebox";

const BodySchema = T.Object({
	url: T.String()
});

export const URLController = (app: App) => {
	app.post(
		"/shorten",
		{
			preHandler: [app.authenticate],
			schema: {
				body: BodySchema
			}
		},
		async (request, reply) => {
			try {
				const { url } = request.body;
				const shortenedUrl = await app.services.url.shortenUrl(url);

				return reply.code(200).send({ url: shortenedUrl });
			} catch (error) {
				if (error instanceof InvalidURL) {
					app.log.error(error, error.message);
					return reply.code(400).send({ error: error.message });
				} else {
					app.log.error(error, "Internal Server Error");
					return reply.code(500).send({ error: "Internal Server Error" });
				}
			}
		}
	);

	app.post(
		"/original",
		{
			preHandler: [app.authenticate],
			schema: {
				body: BodySchema
			}
		},
		async (request, reply) => {
			try {
				const { url: shortenedUrl } = request.body;
				const originalUrl = await app.services.url.getOriginalUrl(shortenedUrl);

				return reply.code(200).send({ url: originalUrl });
			} catch (error) {
				if (error instanceof InvalidShortenedURL) {
					app.log.error(error, error.message);
					return reply.code(400).send({ error: error.message });
				} else {
					app.log.error(error, "Internal Server Error");
					return reply.code(500).send({ error: "Internal Server Error" });
				}
			}
		}
	);
};
