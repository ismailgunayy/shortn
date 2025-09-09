import { ShortnError } from "~/errors";
import fastifyPlugin from "fastify-plugin";

export const error = fastifyPlugin((app) => {
	app.setErrorHandler((error, _request, reply) => {
		if (error.validation) {
			const validationErrors = error.validation.map((err) => {
				let field = err.instancePath.substring(1); // Remove leading slash

				if (field === "" && err.message?.includes("expected object, received null")) {
					field = "body";
				}

				return {
					field,
					message: err.message || "Validation failed"
				};
			});

			return reply.code(400).send({
				success: false,
				error: {
					message: "Validation failed",
					details: validationErrors
				}
			});
		}

		if (error instanceof ShortnError) {
			app.log.error(error, error.message);

			return reply.code(error.statusCode).send({
				success: false,
				error: {
					message: error.message
				}
			});
		}

		app.log.error(error, "Internal Server Error");
		return reply.code(500).send({
			success: false,
			error: {
				message: "Internal Server Error"
			}
		});
	});
});
