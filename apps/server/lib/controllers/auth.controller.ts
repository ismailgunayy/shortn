import { App } from "~/types/fastify";
import { Type } from "@sinclair/typebox";

const ResponseSchema = Type.Object({
	access_token: Type.String()
});

export const AuthController = (app: App) => {
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
						expiresIn: app.config.auth.JWT_EXPIRES_IN
					}
				}
			);
			return reply.send({ access_token: token });
		}
	);
};
