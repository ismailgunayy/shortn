import { App } from "~/types/fastify";
import { FastifyRequest } from "fastify";
import { TokenType } from "~/modules/auth/auth.service";
import { Unauthorized } from "~/modules/auth/auth.error";
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
		// Access Token
		if (request.cookies[TokenType.ACCESS]) {
			const payload = app.services.auth.authenticateAccessToken(request);

			const userData = await app.services.auth.me(payload.userId);
			request.session = {
				id: payload.sessionId,
				user: { ...userData, authenticatedWith: "accessToken" }
			};
		}
		// API Key
		else if (request.headers.authorization) {
			const authHeader = request.headers.authorization;

			if (!authHeader.startsWith("Bearer ") && !authHeader.startsWith("Token ")) {
				throw new Unauthorized();
			}

			const parts = authHeader.split(" ");
			if (parts.length !== 2 || !parts[1] || parts[1].trim() === "") {
				throw new Unauthorized();
			}

			const apiKey = parts[1];
			const { userId } = await app.services.apiKey.verifyApiKey(apiKey);

			const userData = await app.services.auth.me(userId);

			request.session = {
				id: crypto.randomUUID(),
				user: { ...userData, authenticatedWith: "apiKey" }
			};
		} else {
			throw new Unauthorized();
		}

		if (request.session.user.email === app.config.AUTH.SERVICE_ACCOUNT_EMAIL) {
			request.session.user.isServiceAccount = true;
		}
	});

	app.decorate("authenticateSession", async (request: FastifyRequest) => {
		if (request.cookies[TokenType.ACCESS]) {
			const payload = app.services.auth.authenticateAccessToken(request);
			const user = await app.services.auth.me(payload.userId);

			request.session = {
				id: payload.sessionId,
				user: { ...user, authenticatedWith: "accessToken" }
			};
		} else {
			throw new Unauthorized();
		}
	});
});
