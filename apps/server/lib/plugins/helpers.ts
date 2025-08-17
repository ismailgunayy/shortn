import { App } from "~/types/fastify";
import { Base62Helper } from "~/helpers/base62.helper";
import { URLHelper } from "~/helpers/url.helper";
import fastifyPlugin from "fastify-plugin";

export const helpers = fastifyPlugin((app: App) => {
	const base62Helper = new Base62Helper(app);
	const urlHelper = new URLHelper(app);

	app.decorate("helpers", {
		base62: base62Helper,
		url: urlHelper
	});
});
