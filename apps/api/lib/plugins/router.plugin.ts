import { App } from "~/types/fastify";
import { AuthController } from "~/modules/auth/auth.controller";
import { UrlController } from "~/modules/url/url.controller";
import fastifyPlugin from "fastify-plugin";
import z from "zod";

export const HealthController = (app: App) => {
	app.get(
		"/health",
		{
			schema: {
				hide: true,
				description: "Health check endpoint to verify API status",
				response: {
					200: z.object({
						status: z.literal("OK")
					})
				}
			}
		},
		(_request, reply) => {
			reply.code(200).send({
				status: "OK"
			});
		}
	);
};

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
