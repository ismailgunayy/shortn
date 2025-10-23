import z from "zod";

export const IdSchema = z.coerce.number();

export const PaginationSchema = z.object({
	page: z.number(),
	limit: z.number(),
	total: z.number(),
	totalPages: z.number(),
	hasNext: z.boolean(),
	hasPrev: z.boolean(),
	sortBy: z.string(),
	sortOrder: z.string()
});
