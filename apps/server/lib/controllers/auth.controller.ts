import { App } from "~/types/fastify";
import { Type } from "@sinclair/typebox";

const ResponseSchema = Type.Object({
	access_token: Type.String()
});

const AuthController = (app: App) => {
	return app.get(
		"/",
		{
			schema: {
				response: {
					200: ResponseSchema
				}
			}
		},
		async (_request, reply) => {
			const token = await reply.jwtSign(
				{},
				{
					sign: {
						// numbers treated as seconds
						expiresIn: app.config.JWT_EXPIRES_IN
					}
				}
			);
			return reply.send({ access_token: token });
		}
	);
};

export default AuthController;
