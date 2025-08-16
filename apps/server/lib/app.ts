import Fastify from "fastify";
import auth from "./plugins/auth";
import { config } from "./plugins/config";
import { cors } from "./plugins/cors";
import helmet from "@fastify/helmet";
import mainRouter from "./router";
import { rateLimit } from "./plugins/rateLimit";

const app = Fastify({
	logger: {
		timestamp: () => `,"time":"${new Date().toISOString()}"`
	}
});

await app.register(helmet, {
	crossOriginEmbedderPolicy: false
});
await app.register(config);
await app.register(auth);
await app.register(rateLimit);
await app.register(cors);

await app.register(mainRouter);

const start = async () => {
	await app.listen({ port: parseInt(app.config.PORT) });
};

// TODO: Implement graceful shutdown
start()
	.then(() => {
		app.log.info(`Server listening on ${app.config.PORT}`);
	})
	.catch((err) => {
		app.log.error(err);
	});
