import {
	InvalidCustomCodeFormat,
	InvalidCustomCodeLength,
	InvalidShortenedUrl,
	InvalidShortenedUrlDomain,
	InvalidUrl,
	InvalidUrlProtocol,
	UrlError
} from "~/errors";
import { ShortnCustomUrls, ShortnUrls } from "~/types/db";

import { APP_CONFIG } from "~/common/config";
import z from "zod";

export const UrlSchema = z.url().refine((url) => {
	try {
		const parsedUrl = new URL(url);

		if (APP_CONFIG.IS_PRODUCTION && parsedUrl.protocol !== "https:") {
			throw new InvalidUrlProtocol();
		}

		return true;
	} catch (err) {
		if (err instanceof UrlError) {
			throw err;
		}

		throw new InvalidUrl();
	}
});

export const ShortenedUrlSchema = UrlSchema.refine((url) => {
	try {
		const parsedUrl = new URL(url);
		const clientUrl = new URL(APP_CONFIG.HTTP.CLIENT_URL);

		if (parsedUrl.hostname !== clientUrl.hostname) {
			throw new InvalidShortenedUrlDomain();
		}

		return true;
	} catch (err) {
		if (err instanceof UrlError) {
			throw err;
		}

		throw new InvalidShortenedUrl();
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
