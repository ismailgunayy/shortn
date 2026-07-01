import { ApiKeyService } from "~/modules/api-key/api-key.service";
import { AuthMethod, AuthService, TokenType } from "~/modules/auth/auth.service";
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Kysely, Selectable } from "kysely";

import { CacheService } from "~/modules/cache/cache.service";
import { DB } from "./db";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import { TConfig } from "~/common/config";
import { UrlService } from "~/modules/url/url.service";

interface JWTPayload {
	sessionId: string;
	userId: number;
	tokenType: TokenType;
}

interface User extends Selectable<Omit<DB["shortn.users"], "password">> {
	isServiceAccount?: boolean;
	authenticatedWith: AuthMethod;
}

export interface Session {
	id: DB["shortn.sessions"]["id"];
	user: User;
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: JWTPayload;
		user: never;
	}

	interface JWT {
		sign(payload: JWTPayload, options?: Partial<SignOptions>): string;
		verify(token: string, options?: Partial<VerifyOptions>): JWTPayload;
		decode(token: string, options?: Partial<DecodeOptions>): JWTPayload | undefined;
	}
}

declare module "fastify" {
	interface FastifyRequest {
		startTime?: number;
		session: Session;
	}

	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		authenticateSession: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		config: TConfig;
		db: Kysely<DB>;
		services: {
			apiKey: ApiKeyService;
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
