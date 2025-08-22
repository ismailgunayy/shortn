import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";

import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Kysely } from "kysely";
import { Pool } from "pg";
import { createClient } from "redis";
import { TConfig } from "~/common/config";
import { URLService } from "~/services/url.service";
import { DB } from "./db-schema";

declare module "kysely" {
	interface Kysely {
		pool: Pool;
	}
}

declare module "fastify" {
	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		config: TConfig;
		cache: ReturnType<typeof createClient>;
		db: Kysely<DB>;
		services: {
			url: URLService;
		};
	}
}

export type App = FastifyInstance<
	RawServerDefault,
	IncomingMessage,
	ServerResponse<IncomingMessage>,
	FastifyBaseLogger,
	TypeBoxTypeProvider
>;
