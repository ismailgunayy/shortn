import { FastifyReply, FastifyRequest } from "fastify";

import { App } from "~/types/fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyPlugin from "fastify-plugin";

const auth = fastifyPlugin(async (app: App) => {
	app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			request.log.error(err);
			return reply.code(401).send({ error: "Auth error! Please get a valid token by sending a request to /auth" });
		}
	});

	await app.register(fastifyJwt, {
		secret: app.config.JWT_SECRET
	});
});

export default auth;
