import { App } from "~/types/fastify";
import { FastifyRequest } from "fastify";
import { TokenType } from "~/services/auth.service";
import { Unauthorized } from "~/errors/auth.error";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyPlugin from "fastify-plugin";

export const auth = fastifyPlugin(async (app: App) => {
	await app.register(fastifyCookie, {
		secret: app.config.AUTH.COOKIE_SECRET
	});

	await app.register(fastifyJwt, {
		secret: app.config.AUTH.JWT.SECRET
	});

	app.decorate("authenticate", async (request, _reply) => {
		let user;

		if (request.cookies[TokenType.ACCESS]) {
			const decoded = app.helpers.auth.authenticateAccessToken(request);

			user = await app.services.auth.me(decoded.id);
		} else if (request.headers.authorization) {
			const apiKey = request.headers.authorization.split(" ")[1];
			const { userId } = await app.services.auth.verifyApiKey(apiKey);

			user = await app.services.auth.me(userId);
			user = { ...user, apiKey };
		} else {
			throw new Unauthorized();
		}

		request.user = user;
	});

	app.decorate("authenticateSession", async (request: FastifyRequest) => {
		if (request.cookies[TokenType.ACCESS]) {
			const decoded = app.helpers.auth.authenticateAccessToken(request);
			const user = await app.services.auth.me(decoded.id);

			request.user = user;
		} else {
			throw new Unauthorized();
		}
	});
});
