import { App } from "~/types/fastify";
import fastifyCors from "@fastify/cors";
import fastifyPlugin from "fastify-plugin";

export const cors = fastifyPlugin(async (app: App) => {
	await app.register(fastifyCors, {
		origin: (origin, cb) => {
			if (app.config.NODE_ENV === "development") {
				return cb(null, true);
			}

			if (!origin) {
				return cb(new Error("Not allowed"), false);
			}
		}
	});
});
