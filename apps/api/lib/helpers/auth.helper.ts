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
import { CacheType } from "~/services/cache.service";
import { TokenType } from "~/services/auth.service";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export class AuthHelper {
	constructor(private readonly app: App) {}

	public setTokenCookie(name: TokenType, token: string, reply: FastifyReply) {
		let options = {};

		if (name === TokenType.ACCESS) {
			options = {
				maxAge: this.app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS
			};
		} else if (name === TokenType.REFRESH) {
			options = {
				maxAge: this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS
			};
		}

		reply.setCookie(name, token, {
			secure: this.app.config.IS_PRODUCTION,
			sameSite: "lax",
			signed: true,
			path: "/",
			domain: this.app.config.IS_PRODUCTION ? ".up.railway.app" : undefined,
			...options
		});
	}

	public clearTokenCookies(reply: FastifyReply) {
		reply.clearCookie(TokenType.ACCESS);
		reply.clearCookie(TokenType.REFRESH);
	}

	public generateToken(payload: JWTPayload) {
		const expiresIn =
			payload.tokenType === TokenType.ACCESS
				? this.app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS
				: this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS;

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

				const cachedToken = await this.app.services.cache.get(CacheType.REFRESH, decoded.id.toString());

				if (!cachedToken) {
					throw new InvalidOrExpiredToken();
				}

				await this.app.services.cache.del(CacheType.REFRESH, decoded.id.toString());
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
