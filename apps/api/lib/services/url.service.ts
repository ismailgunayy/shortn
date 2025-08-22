import { InvalidShortenedURL, InvalidURL } from "~/errors/url.error";

import { App } from "~/types/fastify";
import { Base62 } from "~/helpers/base62.helper";
import { URLRepository } from "~/repositories/url.repository";

export class URLService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: URLRepository
	) {}

	private isUrlValid(url: string): boolean {
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

	private isShortenedUrlValid(url: string): boolean {
		if (this.isUrlValid(url) && url.includes(this.app.config.CLIENT_URL)) return true;

		return false;
	}

	async shortenUrl(url: string) {
		if (!this.isUrlValid(url)) {
			throw new InvalidURL();
		}

		const { id } = await this.urlRepository.insert(url);
		const shortCode = Base62.encode(id);
		const shortenedUrl = `${this.app.config.CLIENT_URL}/${shortCode}`;

		this.app.cache
			.set(shortenedUrl, url, {
				expiration: {
					type: "EX",
					value: 60 * 60 * 24 // 1 day
				}
			})
			.catch((error) => {
				this.app.log.error(error, "Failed to cache shortened URL");
			});

		return shortenedUrl;
	}

	async getOriginalUrl(url: string) {
		if (!this.isShortenedUrlValid(url)) {
			throw new InvalidShortenedURL();
		}

		const cachedUrl = await this.app.cache.get(url);
		if (cachedUrl) {
			return cachedUrl;
		}

		const shortCode = url.split("/").pop();
		if (!shortCode) {
			throw new InvalidShortenedURL();
		}

		const id = Base62.decode(shortCode);
		const { url: originalUrl } = await this.urlRepository.findById(id);
		return originalUrl;
	}
}
