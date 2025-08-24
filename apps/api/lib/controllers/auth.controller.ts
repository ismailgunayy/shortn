import { App } from "~/types/fastify";
import { Type } from "@sinclair/typebox";

const ResponseSchema = Type.Object({
	accessToken: Type.String(),
	expiresIn: Type.String()
});

const ErrorSchema = Type.Object({
	error: Type.String()
});

export const AuthController = (app: App) => {
	return app.get(
		"/",
		{
			schema: {
				response: {
					200: ResponseSchema,
					500: ErrorSchema
				}
			}
		},
		async (_request, reply) => {
			try {
				const token = await reply.jwtSign(
					{},
					{
						sign: {
							// numbers treated as seconds
							expiresIn: app.config.JWT_EXPIRES_IN
						}
					}
				);
				return reply.send({
					accessToken: token,
					expiresIn: app.config.JWT_EXPIRES_IN
				});
			} catch (error) {
				app.log.error(error, "Error authenticating user");
				return reply.code(500).send({ error: "Internal Server Error" });
			}
		}
	);
};
