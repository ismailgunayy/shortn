import { InvalidShortenedUrl, InvalidShortenedUrlDomain, InvalidUrl, InvalidUrlProtocol, UrlError } from "~/errors";

import { APP_CONFIG } from "~/common/config";
import z from "zod";

export const UrlSchema = z.url().refine((url) => {
	try {
		const parsedUrl = new URL(url);

		if (APP_CONFIG.IS_PRODUCTION && parsedUrl.protocol !== "https:") {
			throw new InvalidUrlProtocol();
		}

		return true;
	} catch (error) {
		if (error instanceof UrlError) {
			throw error;
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
	} catch (error) {
		if (error instanceof UrlError) {
			throw error;
		}

		throw new InvalidShortenedUrl();
	}
});

export const CustomCodeSchema = z
	.string()
	.max(30)
	.regex(/^[a-zA-Z0-9_-]+$/, "Custom code can only contain letters, numbers, underscores, and hyphens.");
