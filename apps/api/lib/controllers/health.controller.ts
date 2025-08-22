import { App } from "~/types/fastify";

export const HealthController = (app: App) => {
	app.get("/", (_request, reply) => {
		return reply.code(200).send({ status: "OK" });
	});
};
