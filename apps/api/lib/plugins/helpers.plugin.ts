import { AuthHelper, UrlHelper } from "~/helpers";

import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

export const helpers = fastifyPlugin((app: App) => {
	const authHelper = new AuthHelper(app);
	const urlHelper = new UrlHelper();

	app.decorate("helpers", {
		auth: authHelper,
		url: urlHelper
	});
});
