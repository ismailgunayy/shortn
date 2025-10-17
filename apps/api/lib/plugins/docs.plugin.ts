import type { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";
import { default as fastifySwagger } from "@fastify/swagger";
import { default as fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyZodOpenApiTransformers } from "fastify-zod-openapi";

export enum ApiTags {
	URL = "URL"
}

export const docs = fastifyPlugin(async (app: App) => {
	await app.register(fastifySwagger, {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: "Shortn API",
				description: "URL shortener API built with Fastify and TypeScript",
				version: "1.0.0",
				contact: {
					name: "Shortn GitHub Issues",
					url: "https://github.com/ismailgunayy/shortn/issues"
				},
				license: {
					name: "MIT",
					url: "https://opensource.org/licenses/MIT"
				}
			},
			servers: [
				{
					url: app.config.HTTP.BASE_URL,
					description: "Shortn API"
				}
			],
			tags: [
				{
					name: ApiTags.URL,
					description: "URL management endpoints"
				}
			],
			components: {
				securitySchemes: {
					apiKeyAuth: {
						type: "apiKey",
						in: "header",
						name: "Authorization",
						description: "Provide your API key in the Authorization header like `Token <API_KEY>`"
					}
				}
			},
			security: [
				{
					apiKeyAuth: []
				}
			]
		},
		...fastifyZodOpenApiTransformers
	});

	await app.register(fastifySwaggerUi, {
		routePrefix: "/",
		staticCSP: false,
		theme: {
			title: "Shortn API Docs"
		},
		uiConfig: {
			deepLinking: true,
			displayOperationId: false,
			defaultModelsExpandDepth: 1,
			defaultModelExpandDepth: 1,
			defaultModelRendering: "example",
			displayRequestDuration: true,
			docExpansion: "list",
			showExtensions: false,
			showCommonExtensions: false,
			tryItOutEnabled: true,
			validatorUrl: null,
			supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
			syntaxHighlight: {
				activate: true,
				theme: "monokai"
			}
		}
	});

	app.addHook("onRequest", (request, reply, done) => {
		const isDocsHost = request.headers.host === new URL(app.config.HTTP.DOCS_URL).hostname;

		const baseCsp =
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self';";

		const defaultSrc = "'self'" + (isDocsHost ? ` ${app.config.HTTP.BASE_URL}` : "");
		const connectSrc = "'self'" + (isDocsHost ? ` ${app.config.HTTP.BASE_URL}` : "");

		reply.header("Content-Security-Policy", `default-src ${defaultSrc}; connect-src ${connectSrc}; ${baseCsp}`);

		done();
	});
});
