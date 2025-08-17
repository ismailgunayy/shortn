import { auth, config, cors, db, rateLimit, services } from "./plugins";

import Fastify from "fastify";
import helmet from "@fastify/helmet";
import { mainRouter } from "./router";

const app = Fastify({
	logger: {
		timestamp: () => `,"time":"${new Date().toISOString()}"`
	}
});

await app.register(config);
await app.register(helmet, {
	crossOriginEmbedderPolicy: false
});
await app.register(cors);
await app.register(db);
await app.register(rateLimit);
await app.register(auth);

await app.register(services);
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
