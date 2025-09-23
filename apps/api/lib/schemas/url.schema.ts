import z from "zod";

export const CustomCodeSchema = z
	.string()
	.max(30)
	.regex(/^[a-zA-Z0-9_-]+$/, "Custom code can only contain letters, numbers, underscores, and hyphens.");
