import { EmailSchema, FullNameSchema, PasswordSchema } from "~/modules/auth/auth.schema";
import { InvalidCookieSignature, RefreshTokenNotFound } from "./auth.error";

import { App } from "~/types/fastify";
import { CookieSerializeOptions } from "@fastify/cookie";
import { FastifyReply } from "fastify";
import { TokenType } from "./auth.service";
import { createResponseSchema } from "~/common/schema";
import z from "zod";

export const AuthController = (app: App) => {
	const accessTokenExpiresIn = app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS;
	const refreshTokenExpiresIn = app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS;

	const defaultCookieOptions: CookieSerializeOptions = {
		secure: app.config.IS_PRODUCTION,
		sameSite: "lax",
		signed: true,
		path: "/",
		domain: new URL(app.config.HTTP.CLIENT_URL).hostname
	};

	const setTokenCookie = (name: TokenType, token: string, reply: FastifyReply) => {
		let options = {};

		if (name === TokenType.ACCESS) {
			options = {
				maxAge: accessTokenExpiresIn
			};
		} else if (name === TokenType.REFRESH) {
			options = {
				maxAge: refreshTokenExpiresIn
			};
		}

		reply.setCookie(name, token, {
			...defaultCookieOptions,
			...options
		});
	};

	const clearTokenCookies = (reply: FastifyReply) => {
		reply.clearCookie(TokenType.ACCESS, {
			...defaultCookieOptions,
			maxAge: accessTokenExpiresIn
		});
		reply.clearCookie(TokenType.REFRESH, {
			...defaultCookieOptions,
			maxAge: refreshTokenExpiresIn
		});
	};

	app.post(
		"/auth/register",
		{
			schema: {
				hide: true,
				description: "Register a new user",
				body: z.object({
					fullName: FullNameSchema,
					email: EmailSchema,
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
					email: EmailSchema,
					password: PasswordSchema
				}),
				response: createResponseSchema(
					z.object({
						accessTokenExpiresIn: z.number(),
						refreshTokenExpiresIn: z.number(),
						user: z.object({
							id: z.number(),
							fullName: z.string(),
							email: z.email()
						})
					})
				)
			}
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const { user, accessToken, refreshToken } = await app.services.auth.login({
				email,
				password
			});

			setTokenCookie(TokenType.ACCESS, accessToken, reply);
			setTokenCookie(TokenType.REFRESH, refreshToken, reply);

			return reply.code(200).send({
				success: true,
				data: {
					accessTokenExpiresIn,
					refreshTokenExpiresIn,
					user
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
						})
					})
				)
			}
		},
		async (request, reply) => {
			const user = await app.services.auth.me(request.session.user.id);

			return reply.code(200).send({
				success: true,
				data: {
					user: {
						id: user.id,
						fullName: user.fullName,
						email: user.email
					}
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
						accessTokenExpiresIn: z.number(),
						refreshTokenExpiresIn: z.number()
					})
				)
			}
		},

		async (request, reply) => {
			const signedRefreshTokenCookie = request.cookies[TokenType.REFRESH];

			if (!signedRefreshTokenCookie) {
				throw new RefreshTokenNotFound();
			}

			const { value: refreshToken, valid } = request.unsignCookie(signedRefreshTokenCookie);

			if (!valid) {
				throw new InvalidCookieSignature();
			}

			const { newAccessToken, newRefreshToken } = await app.services.auth.authenticateRefreshToken(refreshToken);

			setTokenCookie(TokenType.ACCESS, newAccessToken, reply);
			setTokenCookie(TokenType.REFRESH, newRefreshToken, reply);

			return reply.code(200).send({
				success: true,
				data: {
					accessTokenExpiresIn,
					refreshTokenExpiresIn
				}
			});
		}
	);

	app.patch(
		"/auth/user",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Update the current user's details",
				body: z.object({
					fullName: FullNameSchema
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						email: z.email(),
						fullName: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { fullName } = request.body;

			const user = await app.services.auth.updateUser(request.session.user.id, { fullName });

			return reply.code(200).send({
				success: true,
				data: {
					...user
				}
			});
		}
	);

	app.patch(
		"/auth/password",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Update the current user's password",
				body: z.object({
					currentPassword: PasswordSchema,
					newPassword: PasswordSchema
				}),
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			const { currentPassword, newPassword } = request.body;

			await app.services.auth.changePassword(request.session.user.id, currentPassword, newPassword);

			return reply.code(200).send({
				success: true
			});
		}
	);

	app.delete(
		"/auth",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Delete the current user's account",
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			clearTokenCookies(reply);
			await app.services.auth.deleteUser(request.session.user.id);

			return reply.code(200).send({ success: true });
		}
	);

	app.post(
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
			clearTokenCookies(reply);
			await app.services.auth.logout(request.session.id);

			return reply.code(200).send({ success: true });
		}
	);
};
