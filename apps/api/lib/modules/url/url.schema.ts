import {
	InvalidCustomCodeFormat,
	InvalidCustomCodeLength,
	InvalidShortenedUrlDomain,
	InvalidUrl,
	InvalidUrlProtocol
} from "./url.error";
import { ShortnCustomUrls, ShortnUrls } from "~/types/db";

import { APP_CONFIG } from "~/common/config";
import z from "zod";

export const UrlSchema = z.url({ error: new InvalidUrl().message }).superRefine((url, ctx) => {
	if (!APP_CONFIG.IS_PRODUCTION) return;

	try {
		if (new URL(url).protocol !== "https:") {
			ctx.addIssue({ code: "custom", message: new InvalidUrlProtocol().message });
		}
	} catch {
		// Invalid URL is already reported by z.url(), throwing here will result in duplicate errors
		return;
	}
});

export const ShortenedUrlSchema = UrlSchema.superRefine((url, ctx) => {
	let parsedUrl: URL;

	try {
		parsedUrl = new URL(url);
	} catch {
		// Invalid URL is already reported by z.url(), throwing here will result in duplicate errors
		return;
	}

	if (parsedUrl.hostname !== new URL(APP_CONFIG.HTTP.CLIENT_URL).hostname) {
		ctx.addIssue({ code: "custom", message: new InvalidShortenedUrlDomain().message });
	}
});

export const CustomCodeSchema = z
	.string()
	.trim()
	.min(1, { error: new InvalidCustomCodeLength().message })
	.max(50, { error: new InvalidCustomCodeLength().message })
	.regex(/^[a-zA-Z0-9_-]+$/, { message: new InvalidCustomCodeFormat().message });

export const urlSortFields: (keyof Pick<ShortnUrls, "url" | "createdAt">)[] = ["url", "createdAt"];
export const UrlQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(5).max(250).default(25),
	sortBy: z.enum(urlSortFields).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	search: z.string().min(3).optional()
});

const customUrlSortFields: (keyof Pick<ShortnCustomUrls, "url" | "createdAt" | "customCode">)[] = [
	"url",
	"customCode",
	"createdAt"
];
export const CustomUrlQuerySchema = UrlQuerySchema.extend({
	sortBy: z.enum(customUrlSortFields).default("createdAt")
});
