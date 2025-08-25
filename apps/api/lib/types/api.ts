import { Type as T, TSchema } from "@sinclair/typebox";

const ErrorSchema = T.Object({
	success: T.Boolean(),
	error: T.String()
});

export const createResponseSchema = <TData extends TSchema>(dataSchema: TData) => ({
	200: T.Object({
		success: T.Boolean(),
		data: dataSchema
	}),

	400: ErrorSchema,
	// 401: ErrorSchema,
	// 404: ErrorSchema,
	500: ErrorSchema
});
