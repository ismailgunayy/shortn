import { AuthController, URLController } from "./controllers";

import { App } from "./types/fastify";

export const mainRouter = (app: App) => {
	app.register(
		(app: App) => {
			AuthController(app);
		},
		{
			prefix: "/auth"
		}
	);

	app.register(
		(app: App) => {
			URLController(app);
		},
		{
			prefix: "/url"
		}
	);
};
