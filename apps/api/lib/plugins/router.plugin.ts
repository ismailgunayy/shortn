import { AuthController, HealthController, UrlController } from "~/controllers";

import { App } from "~/types/fastify";
import { AuthMethod } from "~/services/auth.service";
import fastifyPlugin from "fastify-plugin";

const restrictAuthEndpoints = (app: App) => {
	app.addHook("preHandler", (request, reply, done) => {
		if (app.config.IS_LOCAL) {
			return done();
		}

		if (request.user && request.user.authenticatedWith === AuthMethod.ACCESS_TOKEN) {
			return done();
		}

		const { origin } = request.headers;

		if (!origin || !app.config.HTTP.CLIENT_URL.includes(origin)) {
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
		// General endpoints
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
