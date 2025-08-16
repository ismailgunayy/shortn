import { convertFromBase62, convertToBase62 } from "~/helpers/base62";

import { App } from "~/types/fastify";
import { Type as T } from "@sinclair/typebox";
import { isValidUrl } from "~/helpers/isValidURL";

const db: {
	[key: number]: string;
} = {};

const BodySchema = T.Object({
	url: T.String()
});

const URLController = (app: App) => {
	app.post(
		"/shorten",
		{
			preHandler: [app.authenticate],
			schema: {
				body: BodySchema
			}
		},
		(request, reply) => {
			const { url } = request.body;

			if (!isValidUrl(url)) {
				return reply.code(400).send({ error: "Invalid URL" });
			}

			// TODO: Update with DB operation once implemented
			const randomId = Math.floor(Math.random() * 90000) + 10000;
			db[randomId] = url;

			const shortenedUrl = `https://shortn.com/${convertToBase62(randomId)}`;
			return reply.code(200).send({ url: shortenedUrl });
		}
	);

	app.post(
		"/unshorten",
		{
			preHandler: [app.authenticate],
			schema: {
				body: BodySchema
			}
		},
		(request, reply) => {
			const { url: shortenedUrl } = request.body;

			// TODO: Use isValidShortenedUrl
			if (!isValidUrl(shortenedUrl)) {
				return reply.code(400).send({ error: "Invalid URL" });
			}

			const url = new URL(shortenedUrl);

			const id = convertFromBase62(url.pathname.slice(1));
			const originalUrl = db[id];

			if (!originalUrl) {
				return reply.code(404).send({ error: "URL not found" });
			}

			return reply.code(200).send({ url: originalUrl });
		}
	);
};

export default URLController;
