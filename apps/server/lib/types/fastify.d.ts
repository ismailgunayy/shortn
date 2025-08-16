import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { TConfig } from "~/common/config";

declare module "fastify" {
	interface FastifyInstance {
		config: TConfig;
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}

export type App = FastifyInstance<
	RawServerDefault,
	IncomingMessage,
	ServerResponse<IncomingMessage>,
	FastifyBaseLogger,
	TypeBoxTypeProvider
>;
