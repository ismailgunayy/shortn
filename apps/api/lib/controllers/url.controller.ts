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

				setTimeout(() => {
					app.close();
				}, 200);
				return reply.code(200).send({ url: shortenedUrl });
			} catch (error) {
				if (error instanceof InvalidURL) {
					return reply.code(400).send({ error: error.message });
				} else {
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
					return reply.code(400).send({ error: error.message });
				} else {
					return reply.code(500).send({ error: "Internal Server Error" });
				}
			}
		}
	);
};
