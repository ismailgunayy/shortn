import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";

import { DB } from "./db";
import { Kysely, Selectable } from "kysely";
import { TConfig } from "~/common/config";
import { UrlService } from "~/services/url.service";
import { createClient } from "redis";
import { AuthService } from "~/services/auth.service";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { TokenType } from "~/common/enums";
import { AuthHelper, UrlHelper } from "~/helpers";

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
		config: TConfig;
		cache: ReturnType<typeof createClient>;
		db: Kysely<DB>;
		helpers: {
			auth: AuthHelper;
			url: UrlHelper;
		};
		services: {
			url: UrlService;
			auth: AuthService;
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
