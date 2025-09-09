import { AuthController, HealthController, TestController, UrlController } from "./controllers";

import { App } from "./types/fastify";

export const mainRouter = (app: App) => {
	app.register(
		(app: App) => {
			// General endpoints
			app.register(HealthController);

			// Private endpoints
			app.register((app: App) => {
				app.register((app: App) => {
					// TODO: Enable once login system is implemented
					// app.addHook("preHandler", (request, reply, done) => {
					// 	if (app.config.IS_LOCAL) {
					// 		return done();
					// 	}

					// 	const { origin } = request.headers;

					// 	if (!origin || !app.config.HTTP.CLIENT_URL.includes(origin)) {
					// 		return reply.status(403).send({
					// 			success: false,
					// 			error: {
					// 				message: "Forbidden"
					// 			}
					// 		});
					// 	}

					// 	return done();
					// });
					app.register(AuthController);
				});

				app.register((app: App) => {
					app.addHook("preHandler", app.authenticate);
					app.register(UrlController);
					app.register(TestController);
				});
			});
		},
		{ prefix: "/api" }
	);
};
