import { z, type ZodObject } from "zod";

const BaseSuccessSchema = z.object({
	success: z.literal(true)
});

const BaseErrorSchema = z.object({
	success: z.literal(false),
	error: z.object({
		message: z.string(),
		code: z.string().optional(),
		details: z
			.array(
				z.object({
					field: z.string(),
					message: z.string()
				})
			)
			.optional()
	})
});

const createSuccessDataSchema = <T extends ZodObject>(dataSchema: T) =>
	BaseSuccessSchema.extend({
		data: dataSchema
	});

type SuccessStatusCode = 200 | 201;
type ErrorStatusCode = 400 | 401 | 500;

export function createResponseSchema(): Record<ErrorStatusCode, typeof BaseErrorSchema> &
	Record<SuccessStatusCode, typeof BaseSuccessSchema>;

export function createResponseSchema<T extends ZodObject>(
	dataSchema: T
): Record<ErrorStatusCode, typeof BaseErrorSchema> &
	Record<SuccessStatusCode, ReturnType<typeof createSuccessDataSchema<T>>>;

export function createResponseSchema<T extends ZodObject>(dataSchema?: T) {
	const successSchema = dataSchema ? createSuccessDataSchema(dataSchema) : BaseSuccessSchema;
	const errorSchema = BaseErrorSchema;

	return {
		200: successSchema,
		201: successSchema,

		400: errorSchema,
		401: errorSchema,
		500: errorSchema
	};
}
