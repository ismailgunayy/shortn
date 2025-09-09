import { CacheKey, TokenType } from "~/common/enums";
import { EmailSchema, PasswordSchema } from "~/schemas/auth.schema";

import { App } from "~/types/fastify";
import { createResponseSchema } from "~/schemas/api-response.schema";
import z from "zod";

export const AuthController = (app: App) => {
	const accessTokenExpiry = app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS;
	const refreshTokenExpiry = app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS;

	app.post(
		"/auth/register",
		{
			schema: {
				body: z.object({
					fullName: z.string(),
					email: EmailSchema,
					password: PasswordSchema
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						fullName: z.string(),
						email: EmailSchema
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
				body: z.object({
					email: EmailSchema,
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

			await app.cache.set(`${CacheKey.REFRESH}:${refreshToken}`, user.id, {
				expiration: {
					type: "EX",
					value: refreshTokenExpiry
				}
			});

			app.helpers.auth.setTokenCookie(TokenType.ACCESS, accessToken, reply);
			app.helpers.auth.setTokenCookie(TokenType.REFRESH, refreshToken, reply);

			return reply.send({
				success: true,
				data: {
					accessToken,
					refreshToken,
					expiresIn: accessTokenExpiry
				}
			});
		}
	);

	app.post(
		"/auth/refresh",
		{
			schema: {
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

			await app.cache.set(`${CacheKey.REFRESH}:${newRefreshToken}`, decoded.id, {
				expiration: {
					type: "EX",
					value: refreshTokenExpiry
				}
			});

			app.helpers.auth.setTokenCookie(TokenType.ACCESS, newAccessToken, reply);
			app.helpers.auth.setTokenCookie(TokenType.REFRESH, newRefreshToken, reply);

			return reply.send({
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
			preHandler: [app.authenticate],
			schema: {
				response: createResponseSchema()
			}
		},
		// eslint-disable-next-line require-await
		async (_request, reply) => {
			app.helpers.auth.clearTokenCookies(reply);

			// TODO: Remove the refresh token from the cache too

			return reply.code(200).send({ success: true });
		}
	);

	app.post(
		"/auth/generate-key",
		{
			preHandler: [app.authenticate],
			schema: {
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

			return reply.send({
				success: true,
				data: {
					...apiKey
				}
			});
		}
	);
};
