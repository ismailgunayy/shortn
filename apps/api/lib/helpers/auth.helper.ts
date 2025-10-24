import {
	AccessTokenNotFound,
	InvalidCookieSignature,
	InvalidOrExpiredToken,
	InvalidTokenType,
	RefreshTokenNotFound
} from "~/errors";
import { App, JWTPayload } from "~/types/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { compare, hash } from "bcrypt";

import { API_KEY_LENGTH } from "~/schemas/auth.schema";
import { CacheKind } from "~/services/cache.service";
import { CookieSerializeOptions } from "@fastify/cookie";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export enum TokenType {
	ACCESS = "shortn_access_token",
	REFRESH = "shortn_refresh_token"
}

export type AuthMethod = "accessToken" | "apiKey";

export class AuthHelper {
	private accessTokenExpiresIn: number;
	private refreshTokenExpiresIn: number;
	private defaultCookieOptions: CookieSerializeOptions;

	constructor(private readonly app: App) {
		this.accessTokenExpiresIn = this.app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS + 300; // Add 5 minutes buffer
		this.refreshTokenExpiresIn = this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS + 300; // Add 5 minutes buffer

		this.defaultCookieOptions = {
			secure: this.app.config.IS_PRODUCTION,
			sameSite: "lax",
			signed: true,
			path: "/",
			domain: new URL(this.app.config.HTTP.CLIENT_URL).hostname
		};
	}

	public setTokenCookie(name: TokenType, token: string, reply: FastifyReply) {
		let options = {};

		if (name === TokenType.ACCESS) {
			options = {
				maxAge: this.accessTokenExpiresIn
			};
		} else if (name === TokenType.REFRESH) {
			options = {
				maxAge: this.refreshTokenExpiresIn
			};
		}

		reply.setCookie(name, token, {
			...this.defaultCookieOptions,
			...options
		});
	}

	public clearTokenCookies(reply: FastifyReply) {
		reply.clearCookie(TokenType.ACCESS, {
			...this.defaultCookieOptions,
			maxAge: this.accessTokenExpiresIn
		});
		reply.clearCookie(TokenType.REFRESH, {
			...this.defaultCookieOptions,
			maxAge: this.refreshTokenExpiresIn
		});
	}

	public generateToken(payload: JWTPayload) {
		const expiresIn = payload.tokenType === TokenType.ACCESS ? this.accessTokenExpiresIn : this.refreshTokenExpiresIn;

		return this.app.jwt.sign(payload, { expiresIn });
	}

	public authenticateAccessToken(request: FastifyRequest) {
		let decoded;

		if (request.cookies[TokenType.ACCESS]) {
			const { value: accessToken, valid } = request.unsignCookie(request.cookies[TokenType.ACCESS]);

			if (!valid) {
				throw new InvalidCookieSignature();
			}

			try {
				decoded = this.app.jwt.verify(accessToken);

				if (decoded.tokenType !== TokenType.ACCESS) {
					throw new InvalidTokenType();
				}
			} catch (err) {
				throw new InvalidOrExpiredToken(err);
			}
		} else {
			throw new AccessTokenNotFound();
		}

		return decoded;
	}

	public async authenticateRefreshToken(request: FastifyRequest) {
		let decoded;

		if (request.cookies[TokenType.REFRESH]) {
			const { value: refreshToken, valid } = request.unsignCookie(request.cookies[TokenType.REFRESH]);

			if (!valid) {
				throw new InvalidCookieSignature();
			}

			try {
				decoded = this.app.jwt.verify(refreshToken);

				if (decoded.tokenType !== TokenType.REFRESH) {
					throw new InvalidTokenType();
				}

				const cachedToken = await this.app.services.cache.get(CacheKind.REFRESH, decoded.id.toString());

				if (!cachedToken) {
					throw new InvalidOrExpiredToken();
				}

				await this.app.services.cache.del(CacheKind.REFRESH, decoded.id.toString());
			} catch (err) {
				throw new InvalidOrExpiredToken(err);
			}
		} else {
			throw new RefreshTokenNotFound();
		}

		return decoded;
	}

	public async hashPassword(password: string) {
		return await hash(password, SALT_ROUNDS);
	}

	public async verifyPassword(password: string, hash: string) {
		return await compare(password, hash);
	}

	public generateApiKey() {
		return crypto.randomBytes(API_KEY_LENGTH).toString("hex");
	}

	public hashApiKey(key: string) {
		return crypto.createHash("sha256").update(key).digest("hex");
	}
}
