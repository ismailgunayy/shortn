import { AuthController, HealthController, UrlController } from "~/controllers";

import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

const restrictAuthEndpoints = (app: App) => {
	app.addHook("onRequest", (request, reply, done) => {
		if (app.config.IS_LOCAL) {
			return done();
		}

		if (request.user?.authenticatedWith === "accessToken") {
			return done();
		}

		return reply.status(403).send({
			success: false,
			error: {
				message: "Forbidden"
			}
		});
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
