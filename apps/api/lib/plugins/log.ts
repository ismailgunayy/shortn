import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

export const log = fastifyPlugin((app: App) => {
	app.addHook("preHandler", function (req, _reply, done) {
		if (req.body) {
			app.log.info(
				{
					body: req.body,
					req: {
						method: req.method,
						host: req.host,
						url: req.url
					}
				},
				"Incoming Request with Payload"
			);
		}
		done();
	});

	app.addHook("preSerialization", (request, _reply, payload, done) => {
		if (payload) {
			app.log.info({ body: payload }, "Outgoing Response with Payload");
		}
		done();
	});
});
