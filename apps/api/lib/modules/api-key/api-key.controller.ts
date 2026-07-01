import { IdSchema, createResponseSchema } from "~/common/schema";

import { ApiKeyNameSchema } from "./api-key.schema";
import { App } from "~/types/fastify";
import z from "zod";

export const ApiKeyController = (app: App) => {
	app.get(
		"/auth/api-keys",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Get all API keys of the current user",
				response: createResponseSchema(
					z.object({
						apiKeys: z.array(
							z.object({
								id: z.number(),
								name: z.string(),
								lastFour: z.string(),
								createdAt: z.date(),
								lastUsedAt: z.date()
							})
						)
					})
				)
			}
		},
		async (request, reply) => {
			const apiKeys = await app.services.apiKey.getApiKeysOfUser(request.session.user.id);

			return reply.code(200).send({
				success: true,
				data: {
					apiKeys
				}
			});
		}
	);

	app.post(
		"/auth/api-keys",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Create a new API key for the current user",
				body: z.object({
					name: ApiKeyNameSchema
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						key: z.string(),
						name: z.string(),
						lastFour: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { name } = request.body;

			const apiKey = await app.services.apiKey.createApiKey(request.session.user.id, name);

			return reply.code(200).send({
				success: true,
				data: {
					...apiKey
				}
			});
		}
	);

	app.patch(
		"/auth/api-keys/:id",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Update an existing API key of the current user",
				params: z.object({
					id: IdSchema
				}),
				body: z.object({
					name: ApiKeyNameSchema
				}),
				response: createResponseSchema(
					z.object({
						id: z.number(),
						name: z.string(),
						lastFour: z.string()
					})
				)
			}
		},
		async (request, reply) => {
			const { id } = request.params;
			const { name } = request.body;

			const apiKey = await app.services.apiKey.updateApiKey(id, request.session.user.id, name);

			return reply.code(200).send({
				success: true,
				data: {
					...apiKey
				}
			});
		}
	);

	app.delete(
		"/auth/api-keys/:id",
		{
			onRequest: [app.authenticateSession],
			schema: {
				hide: true,
				description: "Delete an existing API key of the current user",
				params: z.object({
					id: IdSchema
				}),
				response: createResponseSchema()
			}
		},
		async (request, reply) => {
			const { id } = request.params;

			await app.services.apiKey.deleteApiKey(id, request.session.user.id);

			return reply.code(200).send({
				success: true
			});
		}
	);
};
