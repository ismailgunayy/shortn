import { InvalidShortenedUrl, InvalidUrl } from "~/errors";

import { App } from "~/types/fastify";
import { CacheKey } from "~/common/enums";
import { UrlHelper } from "~/helpers/url.helper";
import { UrlRepository } from "~/repositories/url.repository";

export class UrlService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: UrlRepository
	) {}

	private isUrlValid(url: string): boolean {
		try {
			const parsed = new URL(url);

			if (this.app.config.IS_LOCAL) {
				return true;
			}

			return parsed.protocol === "https:" && parsed.hostname.length > 0 && parsed.hostname.includes(".");
		} catch {
			return false;
		}
	}

	private isShortenedUrlValid(url: string): boolean {
		if (this.isUrlValid(url) && url.includes(this.app.config.HTTP.CLIENT_URL)) {
			return true;
		}

		return false;
	}

	public async shortenUrl(url: string) {
		if (!this.isUrlValid(url)) {
			throw new InvalidUrl();
		}

		const { id } = await this.urlRepository.insert({ url });
		const shortCode = UrlHelper.encode(id);
		const shortenedUrl = `${this.app.config.HTTP.CLIENT_URL}/${shortCode}`;

		// TODO: Implement a generic error handling mechanism for cache errors
		this.app.cache
			.set(`${CacheKey.URL}:${shortenedUrl}`, url, {
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

	public async getOriginalUrl(url: string) {
		if (!this.isShortenedUrlValid(url)) {
			throw new InvalidShortenedUrl();
		}

		const cachedUrl = await this.app.cache.get(`${CacheKey.URL}:${url}`);
		if (cachedUrl) {
			return cachedUrl;
		}

		const shortCode = url.replace(this.app.config.HTTP.CLIENT_URL + "/", "");
		if (!shortCode) {
			throw new InvalidShortenedUrl();
		}

		const id = UrlHelper.decode(shortCode);
		const { url: originalUrl } = await this.urlRepository.findById(id);

		return originalUrl;
	}
}
