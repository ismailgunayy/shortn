import { InvalidShortenedURL, InvalidURL } from "~/errors/url.error";

import { App } from "~/types/fastify";
import { URLRepository } from "~/repositories/url.repository";

export class URLService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: URLRepository
	) {}

	async shortenUrl(url: string) {
		if (!this.app.helpers.url.isUrlValid(url)) {
			throw new InvalidURL();
		}

		const { id } = await this.urlRepository.insert(url);
		const shortCode = this.app.helpers.base62.encode(id);
		const shortenedUrl = `${this.app.config.CLIENT_URL}/${shortCode}`;

		return shortenedUrl;
	}

	async getOriginalUrl(url: string) {
		if (!this.app.helpers.url.isShortenedUrlValid(url)) {
			throw new InvalidShortenedURL();
		}

		const shortCode = url.split("/").pop();
		if (!shortCode) {
			throw new InvalidShortenedURL();
		}

		const id = this.app.helpers.base62.decode(shortCode);
		const { url: originalUrl } = await this.urlRepository.findById(id);
		return originalUrl;
	}
}
