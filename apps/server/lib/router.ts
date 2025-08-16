import { App } from "./types/fastify";
import AuthController from "./controllers/auth.controller";
import URLController from "./controllers/url.controller";

const mainRouter = (app: App) => {
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

export default mainRouter;
