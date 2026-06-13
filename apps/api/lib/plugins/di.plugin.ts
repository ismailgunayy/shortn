import { App } from "~/types/fastify";
import { AuthHelper } from "~/modules/auth/auth.helper";
import { AuthRepository } from "~/modules/auth/auth.repository";
import { AuthService } from "~/modules/auth/auth.service";
import { CacheService } from "~/modules/cache/cache.service";
import { UrlHelper } from "~/modules/url/url.helper";
import { UrlRepository } from "~/modules/url/url.repository";
import { UrlService } from "~/modules/url/url.service";
import fastifyPlugin from "fastify-plugin";

export const di = fastifyPlugin(async (app: App) => {
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

	const authHelper = new AuthHelper(app);
	const urlHelper = new UrlHelper(app);

	app.decorate("helpers", {
		auth: authHelper,
		url: urlHelper
	});
});
