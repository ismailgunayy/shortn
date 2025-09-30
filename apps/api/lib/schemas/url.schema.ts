import {
	InvalidShortenedUrl,
	InvalidShortenedUrlDomain,
	InvalidUrl,
	InvalidUrlHostname,
	InvalidUrlProtocol,
	UrlError
} from "~/errors";

import { APP_CONFIG } from "~/common/config";
import z from "zod";

export const UrlSchema = z.url().refine((url) => {
	try {
		const parsedUrl = new URL(url);

		if (parsedUrl.hostname.split(".").length < 2) {
			throw new InvalidUrlHostname();
		}

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
	if (APP_CONFIG.IS_LOCAL) {
		return true;
	}

	try {
		const parsedUrl = new URL(url);

		if (parsedUrl.hostname !== APP_CONFIG.HTTP.CLIENT_URL.replace(/^https?:\/\//, "")) {
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
