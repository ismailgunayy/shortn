import { AuthController, HealthController, UrlController } from "~/controllers";

import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

const restrictAuthEndpoints = (app: App) => {
	app.addHook("onRequest", (request, reply, done) => {
		const { origin } = request.headers;

		if (request.user?.authenticatedWith === "apiKey" || !origin || !app.config.HTTP.CLIENT_URL.includes(origin)) {
			return reply.status(403).send({
				success: false,
				error: {
					message: "Forbidden"
				}
			});
		}

		return done();
	});
};

export const router = fastifyPlugin((app: App) => {
	app.register((app: App) => {
		app.register(HealthController);

		app.register((app: App) => {
			restrictAuthEndpoints(app);
			app.register(AuthController);
		});

		app.register((app: App) => {
			app.register(UrlController);
		});
	});
});
