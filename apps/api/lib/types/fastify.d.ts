import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";

import { DB } from "./db-schema";
import { Kysely } from "kysely";
import { Pool } from "pg";
import { TConfig } from "~/common/config";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { URLService } from "~/services/url.service";
import { URLHelper } from "~/helpers/url.helper";
import { Base62Helper } from "~/helpers/base62.helper";

declare module "kysely" {
	interface Kysely {
		pool: Pool;
	}
}

declare module "fastify" {
	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		config: TConfig;
		db: Kysely<DB>;
		helpers: {
			base62: Base62Helper;
			url: URLHelper;
		};
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
