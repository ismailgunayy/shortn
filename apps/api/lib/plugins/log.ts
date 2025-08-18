import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

export const log = fastifyPlugin((app: App) => {
	app.addHook("preHandler", function (req, _reply, done) {
		if (req.body && !req.url.startsWith("/v1")) {
			req.log.info(
				{
					body: req.body,
					method: req.method,
					host: req.host,
					port: req.port,
					url: req.url
				},
				"REQUEST ::"
			);
		}
		done();
	});

	app.addHook("preSerialization", (request, _reply, payload, done) => {
		if (payload) {
			request.log.info({ body: payload }, "RESPONSE ::");
		}
		done();
	});
});
