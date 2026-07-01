import { ApiKeyRepository } from "~/modules/api-key/api-key.repository";
import { ApiKeyService } from "~/modules/api-key/api-key.service";
import { App } from "~/types/fastify";
import { AuthRepository } from "~/modules/auth/auth.repository";
import { AuthService } from "~/modules/auth/auth.service";
import { CacheService } from "~/modules/cache/cache.service";
import { UrlRepository } from "~/modules/url/url.repository";
import { UrlService } from "~/modules/url/url.service";
import fastifyPlugin from "fastify-plugin";

export const di = fastifyPlugin(async (app: App) => {
	const apiKeyRepository = new ApiKeyRepository(app.db);
	const apiKeyService = new ApiKeyService(app, apiKeyRepository);

	const authRepository = new AuthRepository(app.db);
	const authService = new AuthService(app, authRepository);

	const cacheService = new CacheService(app);
	await cacheService.connect();

	const urlRepository = new UrlRepository(app.db);
	const urlService = new UrlService(app, urlRepository);

	app.decorate("services", {
		apiKey: apiKeyService,
		auth: authService,
		cache: cacheService,
		url: urlService
	});
});
