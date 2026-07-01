import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";

const SENSITIVE_FIELDS = [
	"password",
	"currentpassword",
	"newpassword",
	"token",
	"accesstoken",
	"refreshtoken",
	"apikey",
	"key"
];

const sanitizePayload = (payload: unknown): unknown => {
	if (typeof payload !== "object" || payload === null) return payload;

	if (Array.isArray(payload)) {
		return payload.map(sanitizePayload);
	}

	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(payload)) {
		const lowerKey = key.toLowerCase();
		const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field));

		if (isSensitive) {
			sanitized[key] = "[REDACTED]";
		} else if (typeof value === "object" && value !== null) {
			sanitized[key] = sanitizePayload(value);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
};

export const log = fastifyPlugin((app: App) => {
	app.addHook("onRequest", (request, _reply, done) => {
		request.startTime = Date.now();
		done();
	});

	app.addHook("preHandler", function (request, _reply, done) {
		if (request.body && ["POST", "PUT", "PATCH"].includes(request.method)) {
			app.log.info(
				{
					method: request.method,
					url: request.url,
					body: sanitizePayload(request.body)
				},
				"Request"
			);
		}
		done();
	});

	app.addHook("onResponse", (request, reply, done) => {
		const duration = Date.now() - (request.startTime || Date.now());
		let logLevel: "error" | "warn" | "info";
		switch (true) {
			case reply.statusCode >= 500:
				logLevel = "error";
				break;
			case reply.statusCode >= 400:
				logLevel = "warn";
				break;
			default:
				logLevel = "info";
				break;
		}

		app.log[logLevel](
			{
				method: request.method,
				url: request.url,
				status: reply.statusCode,
				duration: `${duration}ms`,
				sessionId: request.session?.id,
				userId: request.session?.user.id
			},
			"Response"
		);

		done();
	});
});
