import {
	AccessTokenNotFound,
	InvalidCookieSignature,
	InvalidOrExpiredToken,
	InvalidTokenType,
	RefreshTokenNotFound
} from "~/errors";
import { App, JWTPayload } from "~/types/fastify";
import { CacheKey, TokenType } from "~/common/enums";
import { FastifyReply, FastifyRequest } from "fastify";

export class AuthHelper {
	constructor(private readonly app: App) {}

	public setTokenCookie(name: TokenType, token: string, reply: FastifyReply) {
		let options = {};

		if (name === TokenType.ACCESS) {
			options = {
				path: "/api",
				maxAge: this.app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS
			};
		} else if (name === TokenType.REFRESH) {
			options = {
				path: "/api/auth",
				maxAge: this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS
			};
		}

		reply.setCookie(name, token, {
			httpOnly: true,
			secure: this.app.config.IS_PRODUCTION,
			sameSite: "strict",
			signed: true,
			...options
		});
	}

	public clearTokenCookies(reply: FastifyReply) {
		reply.clearCookie(TokenType.ACCESS, {
			path: "/api"
		});
		reply.clearCookie(TokenType.REFRESH, {
			path: "/api/auth"
		});
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
			} catch {
				throw new InvalidOrExpiredToken();
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

				const idInCache = await this.app.cache.get(`${CacheKey.REFRESH}:${refreshToken}`);

				if (!idInCache) {
					throw new RefreshTokenNotFound();
				}

				if (idInCache !== decoded.id.toString()) {
					this.app.cache.del(`${CacheKey.REFRESH}:${refreshToken}`);
					throw new RefreshTokenNotFound();
				}
			} catch {
				throw new InvalidOrExpiredToken();
			}
		} else {
			throw new RefreshTokenNotFound();
		}

		return decoded;
	}
}
