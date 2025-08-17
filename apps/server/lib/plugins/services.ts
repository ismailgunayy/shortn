import { App } from "~/types/fastify";
import { URLRepository } from "~/repositories/url.repository";
import { URLService } from "~/services/url.service";
import fastifyPlugin from "fastify-plugin";

export const services = fastifyPlugin((app: App) => {
	const urlRepository = new URLRepository(app.db);
	const urlService = new URLService(urlRepository);

	app.decorate("services", {
		url: urlService
	});
});
