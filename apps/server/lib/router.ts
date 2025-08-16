import { App } from "./types/fastify";
import AuthController from "./controllers/auth.controller";
import URLController from "./controllers/url.controller";

const authRoutes = (app: App) => {
	AuthController(app);
};

const shortenerRoutes = (app: App) => {
	URLController(app);
};

const mainRouter = (app: App) => {
	app.register(authRoutes, {
		prefix: "/auth"
	});

	app.register(shortenerRoutes, {
		prefix: "/url"
	});
};

export default mainRouter;
