import { AuthHelper, UrlHelper } from "~/helpers";
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { Kysely, Selectable } from "kysely";

import { AuthService, TokenType } from "~/services/auth.service";
import { CacheService } from "~/services/cache.service";
import { DB } from "./db";
import { TConfig } from "~/common/config";
import { UrlService } from "~/services/url.service";
import { ZodTypeProvider } from "fastify-type-provider-zod";

interface JWTPayload {
	tokenType: TokenType;
	id: number;
}

interface UserPayload extends Selectable<Omit<DB["shortn.users"], "password">> {
	apiKey?: string;
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: JWTPayload;
		user: UserPayload;
	}

	interface JWT {
		sign(payload: JWTPayload, options?: Partial<SignOptions>): string;
		verify(token: string, options?: Partial<VerifyOptions>): JWTPayload;
		decode(token: string, options?: Partial<DecodeOptions>): JWTPayload | null;
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
	ZodTypeProvider
>;
