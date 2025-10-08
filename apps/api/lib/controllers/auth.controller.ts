import { App } from "~/types/fastify";
import { CacheType } from "~/services/cache.service";
import { PasswordSchema } from "~/schemas/auth.schema";
import { TokenType } from "~/services/auth.service";
import { createResponseSchema } from "~/schemas/api-response.schema";
import z from "zod";

export const AuthController = (app: App) => {
	const accessTokenExpiry = app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS;
	const refreshTokenExpiry = app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS;

	app.post(
		"/auth/register",
		{
			schema: {
				hide: true,
				description: "Register a new user",
				body: z.object({
					fullName: z.string(),
					email: z.email(),
					password: PasswordSchema
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						fullName: z.string(),
						email: z.email()
					})
				)
			}
		},
		async (request, reply) => {
			const { fullName, email, password } = request.body;

			const user = await app.services.auth.register({
				fullName,
				email,
				password
			});

			return reply.code(201).send({
				success: true,
				data: {
					id: user.id,
					fullName: user.fullName,
					email: user.email
				}
			});
		}
	);

	app.post(
		"/auth/login",
		{
			schema: {
				hide: true,
				description: "Login to your account",
				body: z.object({
					email: z.email(),
					password: PasswordSchema
				}),
				response: createResponseSchema(
					z.object({
						accessToken: z.string(),
						refreshToken: z.string(),
						expiresIn: z.number()
					})
				)
			}
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const user = await app.services.auth.login({
				email,
				password
			});

			const accessToken = app.helpers.auth.generateToken({
				id: user.id,
				tokenType: TokenType.ACCESS
			});

			const refreshToken = app.helpers.auth.generateToken({
				id: user.id,
				tokenType: TokenType.REFRESH
			});

			await app.services.cache.set(CacheType.REFRESH, user.id.toString(), refreshToken, {
				expiration: {
					type: "EX",
					value: refreshTokenExpiry
				}
			});

			app.helpers.auth.setTokenCookie(TokenType.ACCESS, accessToken, reply);
			app.helpers.auth.setTokenCookie(TokenType.REFRESH, refreshToken, reply);

			return reply.code(200).send({
				success: true,
				data: {
					accessToken,
					refreshToken,
					expiresIn: accessTokenExpiry
				}
			});
		}
	);

	app.get(
		"/auth/status",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Get the authentication status of the current user",
				response: createResponseSchema(
					z.object({
						user: z.object({
							id: z.number(),
							fullName: z.string(),
							email: z.email()
						}),
						isAuthenticated: z.boolean()
					})
				)
			}
		},
		async (request, reply) => {
			const user = await app.services.auth.me(request.user.id);

			return reply.code(200).send({
				success: true,
				data: {
					user: {
						id: user.id,
						fullName: user.fullName,
						email: user.email
					},
					isAuthenticated: true
				}
			});
		}
	);

	app.post(
		"/auth/refresh",
		{
			schema: {
				hide: true,
				description: "Refresh the access and refresh tokens",
				response: createResponseSchema(
					z.object({
						accessToken: z.string(),
						refreshToken: z.string(),
						expiresIn: z.number()
					})
				)
			}
		},

		async (request, reply) => {
			const decoded = await app.helpers.auth.authenticateRefreshToken(request);

			const newAccessToken = app.helpers.auth.generateToken({
				id: decoded.id,
				tokenType: TokenType.ACCESS
			});

			const newRefreshToken = app.helpers.auth.generateToken({
				id: decoded.id,
				tokenType: TokenType.REFRESH
			});

			await app.services.cache.set(CacheType.REFRESH, decoded.id.toString(), newRefreshToken, {
				expiration: {
					type: "EX",
					value: refreshTokenExpiry
				}
			});

			app.helpers.auth.setTokenCookie(TokenType.ACCESS, newAccessToken, reply);
			app.helpers.auth.setTokenCookie(TokenType.REFRESH, newRefreshToken, reply);

			return reply.code(200).send({
				success: true,
				data: {
					accessToken: newAccessToken,
					refreshToken: newRefreshToken,
					expiresIn: accessTokenExpiry
				}
			});
		}
	);

	app.get(
		"/auth/logout",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Logout the current user",
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			app.helpers.auth.clearTokenCookies(reply);
			await app.services.cache.del(CacheType.REFRESH, request.user.id.toString());

			return reply.code(200).send({ success: true });
		}
	);

	app.get(
		"/auth/api-keys",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Get all API keys of the current user",
				response: createResponseSchema(
					z.object({
						apiKeys: z.array(
							z.object({
								id: z.number(),
								name: z.string(),
								lastFour: z.string(),
								createdAt: z.date(),
								lastUsedAt: z.date()
							})
						)
					})
				)
			}
		},
		async (request, reply) => {
			const apiKeys = await app.services.auth.getApiKeysOfUser(request.user.id);

			return reply.code(200).send({
				success: true,
				data: {
					apiKeys
				}
			});
		}
	);

	app.post(
		"/auth/api-keys",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Create a new API key for the current user",
				body: z.object({
					name: z.string()
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						key: z.string(),
						name: z.string(),
						lastFour: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { name } = request.body;

			const apiKey = await app.services.auth.createApiKey(request.user.id, name);

			return reply.code(200).send({
				success: true,
				data: {
					...apiKey
				}
			});
		}
	);

	app.patch(
		"/auth/api-keys/:id",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Update an existing API key of the current user",
				params: z.object({
					id: z.string().pipe(z.coerce.number())
				}),
				body: z.object({
					name: z.string()
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						name: z.string(),
						lastFour: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { id } = request.params;
			const { name } = request.body;

			const apiKey = await app.services.auth.updateApiKey(id, request.user.id, name);

			return reply.code(200).send({
				success: true,
				data: {
					...apiKey
				}
			});
		}
	);

	app.delete(
		"/auth/api-keys/:id",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Delete an existing API key of the current user",
				params: z.object({
					id: z.string().pipe(z.coerce.number())
				}),
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			const { id } = request.params;

			await app.services.auth.deleteApiKey(id, request.user.id);

			return reply.code(200).send({
				success: true
			});
		}
	);
};
