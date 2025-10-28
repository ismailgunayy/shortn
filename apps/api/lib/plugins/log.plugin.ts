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
	app.addHook("onRequest", (req, _reply, done) => {
		req.startTime = Date.now();
		done();
	});

	app.addHook("preHandler", function (req, _reply, done) {
		if (req.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
			app.log.info(
				{
					method: req.method,
					url: req.url,
					body: sanitizePayload(req.body)
				},
				"Request"
			);
		}
		done();
	});

	app.addHook("onResponse", (req, reply, done) => {
		const duration = Date.now() - (req.startTime || Date.now());
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
				method: req.method,
				url: req.url,
				status: reply.statusCode,
				duration: `${duration}ms`,
				userId: req.user?.id
			},
			"Response"
		);

		done();
	});
});
