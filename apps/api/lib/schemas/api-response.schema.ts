import { z, type ZodObject } from "zod";

const BaseSuccessSchema = z.object({
	success: z.literal(true)
});

const BaseErrorSchema = z.object({
	success: z.literal(false),
	error: z.object({
		message: z.string(),
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

const SUCCESS_CODES = [200, 201] as const;
const ERROR_CODES = [400, 401, 403, 404, 409, 500] as const;

type SuccessStatusCode = (typeof SUCCESS_CODES)[number];
type ErrorStatusCode = (typeof ERROR_CODES)[number];

export function createResponseSchema(): Record<ErrorStatusCode, typeof BaseErrorSchema> &
	Record<SuccessStatusCode, typeof BaseSuccessSchema>;

export function createResponseSchema<T extends ZodObject>(
	dataSchema: T
): Record<ErrorStatusCode, typeof BaseErrorSchema> &
	Record<SuccessStatusCode, ReturnType<typeof createSuccessDataSchema<T>>>;

export function createResponseSchema<T extends ZodObject>(dataSchema?: T) {
	const successSchema = dataSchema ? createSuccessDataSchema(dataSchema) : BaseSuccessSchema;
	const errorSchema = BaseErrorSchema;

	const response = {} as Record<SuccessStatusCode | ErrorStatusCode, typeof successSchema | typeof errorSchema>;

	SUCCESS_CODES.forEach((code) => {
		response[code] = successSchema;
	});

	ERROR_CODES.forEach((code) => {
		response[code] = errorSchema;
	});

	return response;
}
