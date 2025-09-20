import { CustomCodeAlreadyInUse, InvalidShortenedUrl, InvalidUrl } from "~/errors";

import { App } from "~/types/fastify";
import { CacheType } from "./cache.service";
import { UrlRepository } from "~/repositories/url.repository";

enum URLSegment {
	Custom = "c"
}

export class UrlService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: UrlRepository
	) {}

	private buildUrl(shortCode: string, segment?: URLSegment) {
		if (segment === URLSegment.Custom) {
			return `${this.app.config.HTTP.CLIENT_URL}/${URLSegment.Custom}/${shortCode}`;
		}

		return `${this.app.config.HTTP.CLIENT_URL}/${shortCode}`;
	}

	private async handleCustomCode(originalUrl: string, userId: number, customCode: string) {
		const existingCustom = await this.urlRepository.findCustomUrlByCustomCode(customCode);

		if (existingCustom) {
			throw new CustomCodeAlreadyInUse();
		}

		await this.urlRepository.insertCustomUrl({
			url: originalUrl,
			customCode,
			userId
		});

		return this.buildUrl(customCode, URLSegment.Custom);
	}

	private async handleGeneratedCode(originalUrl: string, userId: number) {
		const existing = await this.urlRepository.findUrlByUrl(originalUrl);

		if (existing) {
			return this.buildUrl(this.app.helpers.url.encodeId(existing.id));
		}

		const { id } = await this.urlRepository.insertUrl({ url: originalUrl, userId });

		const shortCode = this.app.helpers.url.encodeId(id);
		return this.buildUrl(shortCode);
	}

	public async shortenUrl(originalUrl: string, userId: number, customCode?: string) {
		if (!this.app.helpers.url.isUrlValid(originalUrl)) {
			throw new InvalidUrl();
		}

		const shortenedUrl = customCode
			? await this.handleCustomCode(originalUrl, userId, customCode)
			: await this.handleGeneratedCode(originalUrl, userId);

		this.app.services.cache.set(CacheType.URL, shortenedUrl, originalUrl, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 // 1 day
			}
		});

		return shortenedUrl;
	}

	public async getOriginalUrl(shortenedUrl: string) {
		if (!this.app.helpers.url.isShortenedUrlValid(shortenedUrl)) {
			throw new InvalidShortenedUrl();
		}

		const cachedUrl = await this.app.services.cache.get(CacheType.URL, shortenedUrl);
		if (cachedUrl) {
			return cachedUrl;
		}

		const slug = shortenedUrl.replace(this.app.config.HTTP.CLIENT_URL + "/", "");
		if (!slug) {
			throw new InvalidShortenedUrl();
		}

		let originalUrl;

		if (slug.startsWith(`${URLSegment.Custom}/`)) {
			const customCode = slug.replace(`${URLSegment.Custom}/`, "");
			const existingCustom = await this.urlRepository.findCustomUrlByCustomCode(customCode);

			if (!existingCustom) {
				throw new InvalidShortenedUrl();
			}

			originalUrl = existingCustom.url;

			return existingCustom.url;
		} else {
			const id = this.app.helpers.url.decodeId(slug);
			const existing = await this.urlRepository.findUrlById(id);

			if (!existing) {
				throw new InvalidShortenedUrl();
			}

			originalUrl = existing.url;
		}

		this.app.services.cache.set(CacheType.URL, shortenedUrl, originalUrl, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 // 1 day
			}
		});

		return originalUrl;
	}
}
