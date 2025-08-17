import { App } from "~/types/fastify";

export class URLHelper {
	constructor(private readonly app: App) {}

	isUrlValid(url: string): boolean {
		try {
			const parsed = new URL(url);

			if (this.app.config.NODE_ENV === "development") {
				return true;
			}

			return parsed.protocol === "https:" && parsed.hostname.length > 0 && parsed.hostname.includes(".");
		} catch {
			return false;
		}
	}

	isShortenedUrlValid(url: string): boolean {
		if (this.isUrlValid(url) && url.includes(this.app.config.CLIENT_URL)) return true;

		return false;
	}
}
