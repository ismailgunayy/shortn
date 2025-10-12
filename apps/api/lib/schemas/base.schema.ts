import z from "zod";

export const IdSchema = z.string().trim().pipe(z.coerce.number());
