import { App } from "~/types/fastify";
import { AuthRepository } from "~/repositories/auth.repository";
import { AuthService } from "~/services/auth.service";
import { CacheService } from "~/services/cache.service";
import { UrlRepository } from "~/repositories/url.repository";
import { UrlService } from "~/services/url.service";
import fastifyPlugin from "fastify-plugin";

export const services = fastifyPlugin(async (app: App) => {
	const authRepository = new AuthRepository(app.db);
	const authService = new AuthService(app, authRepository);

	const cacheService = new CacheService(app);
	await cacheService.connect();

	const urlRepository = new UrlRepository(app.db);
	const urlService = new UrlService(app, urlRepository);

	app.decorate("services", {
		auth: authService,
		cache: cacheService,
		url: urlService
	});
});
