import { App } from "~/types/fastify";
import { Type } from "@sinclair/typebox";
import { createResponseSchema } from "~/types/api";

const AuthResponseSchema = createResponseSchema(
	Type.Object({
		accessToken: Type.String(),
		expiresIn: Type.String()
	})
);

export const AuthController = (app: App) => {
	return app.get(
		"/",
		{
			schema: {
				response: AuthResponseSchema
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
					success: true,
					data: {
						accessToken: token,
						expiresIn: app.config.JWT_EXPIRES_IN
					}
				});
			} catch (error) {
				app.log.error(error, "Error authenticating user");

				return reply.code(500).send({
					success: false,
					error: "Internal Server Error"
				});
			}
		}
	);
};
