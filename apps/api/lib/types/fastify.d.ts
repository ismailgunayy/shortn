import { AuthHelper, type AuthMethod, type TokenType, UrlHelper } from "~/helpers";
import { AuthService } from "~/services/auth.service";
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Kysely, Selectable } from "kysely";

import { CacheService } from "~/services/cache.service";
import { DB } from "./db";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import { TConfig } from "~/common/config";
import { UrlService } from "~/services/url.service";

interface JWTPayload {
	tokenType: TokenType;
	id: number;
}

export interface User extends Selectable<Omit<DB["shortn.users"], "password">> {
	isServiceAccount?: boolean;
	authenticatedWith: AuthMethod;
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: JWTPayload;
		user: User;
	}

	interface JWT {
		sign(payload: JWTPayload, options?: Partial<SignOptions>): string;
		verify(token: string, options?: Partial<VerifyOptions>): JWTPayload;
		decode(token: string, options?: Partial<DecodeOptions>): JWTPayload | undefined;
	}
}

declare module "fastify" {
	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		authenticateSession: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		config: TConfig;
		db: Kysely<DB>;
		helpers: {
			auth: AuthHelper;
			url: UrlHelper;
		};
		services: {
			auth: AuthService;
			cache: CacheService;
			url: UrlService;
		};
	}
}

export type App = FastifyInstance<
	RawServerDefault,
	IncomingMessage,
	ServerResponse<IncomingMessage>,
	FastifyBaseLogger,
	FastifyZodOpenApiTypeProvider
>;
