import { App } from "~/types/fastify";
import { AuthRepository } from "~/repositories/auth.repository";
import { AuthService } from "~/services/auth.service";
import { UrlRepository } from "~/repositories/url.repository";
import { UrlService } from "~/services/url.service";
import fastifyPlugin from "fastify-plugin";

export const services = fastifyPlugin((app: App) => {
	const urlRepository = new UrlRepository(app.db);
	const urlService = new UrlService(app, urlRepository);

	const authRepository = new AuthRepository(app.db);
	const authService = new AuthService(app, authRepository);

	app.decorate("services", {
		url: urlService,
		auth: authService
	});
});
