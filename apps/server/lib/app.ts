import { Config } from "./common/config";
import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import authenticate from "./middlewares/authenticate";
import fastifyJwt from "@fastify/jwt";
import mainRouter from "./router";

const app = Fastify({
	logger: {
		timestamp: () => `,"time":"${new Date().toISOString()}"`
	}
}).withTypeProvider<TypeBoxTypeProvider>();

app.decorate("config", Config);
app.decorate("authenticate", authenticate);

app.register(fastifyJwt, { secret: app.config.JWT_SECRET });
app.register(mainRouter);

const start = async () => {
	await app.listen({
		port: Number.parseInt(app.config.PORT)
	});
};

start()
	.then(() => {
		app.log.info(`Server listening on ${app.config.PORT}`);
	})
	.catch((err) => {
		app.log.error(err);
	});
