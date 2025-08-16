import { App } from "~/types/fastify";

const AuthController = (app: App) => {
	return app.get(
		"/",
		{
			schema: {
				response: {
					200: {
						type: "object",
						properties: {
							token: { type: "string" }
						}
					}
				}
			}
		},
		async (_request, reply) => {
			const token = await reply.jwtSign({});
			return reply.send({ token });
		}
	);
};

export default AuthController;
