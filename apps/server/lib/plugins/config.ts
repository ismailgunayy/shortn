import { App } from "~/types/fastify";
import { Config } from "~/common/config";
import fastifyPlugin from "fastify-plugin";

export const config = fastifyPlugin((app: App) => {
	app.decorate("config", Config);
});
