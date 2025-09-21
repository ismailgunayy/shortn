import { CustomCodeAlreadyInUse, CustomUrlNotFound, InvalidShortenedUrl, InvalidUrl, UrlNotFound } from "~/errors";

import { App } from "~/types/fastify";
import { CacheType } from "./cache.service";
import { URLSegment } from "~/helpers";
import { UrlRepository } from "~/repositories/url.repository";

export class UrlService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: UrlRepository
	) {}

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

		return this.app.helpers.url.buildUrl(customCode, URLSegment.Custom);
	}

	private async handleGeneratedCode(originalUrl: string, userId: number) {
		const existingUrl = await this.urlRepository.findUrlByUrl(originalUrl);

		if (existingUrl) {
			return this.app.helpers.url.buildUrl(this.app.helpers.url.encodeId(existingUrl.id));
		}

		const { id } = await this.urlRepository.insertUrl({ url: originalUrl, userId });

		const shortCode = this.app.helpers.url.encodeId(id);
		return this.app.helpers.url.buildUrl(shortCode);
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
			const existingUrl = await this.urlRepository.findUrl(id);

			if (!existingUrl) {
				throw new InvalidShortenedUrl();
			}

			originalUrl = existingUrl.url;
		}

		this.app.services.cache.set(CacheType.URL, shortenedUrl, originalUrl, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 // 1 day
			}
		});

		return originalUrl;
	}

	public async getUrlsOfUser(userId: number) {
		let urls, customUrls;

		urls = await this.urlRepository.findAllUrlsByUserId(userId);
		customUrls = await this.urlRepository.findAllCustomUrlsByUserId(userId);

		urls = urls.map((url) => ({
			id: url.id,
			originalUrl: url.url,
			shortCode: this.app.helpers.url.encodeId(url.id),
			createdAt: url.createdAt
		}));

		customUrls = customUrls.map((url) => ({
			id: url.id,
			originalUrl: url.url,
			customCode: url.customCode,
			createdAt: url.createdAt
		}));

		return {
			urls,
			customUrls
		};
	}

	public async deleteUrl(id: number, userId: number) {
		const url = await this.urlRepository.findUrl(id);

		if (!url || url.userId !== userId) {
			throw new UrlNotFound();
		}

		await this.urlRepository.deleteUrl(id);
	}

	public async deleteCustomUrl(id: number, userId: number) {
		const url = await this.urlRepository.findCustomUrl(id);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		await this.urlRepository.deleteCustomUrl(id);
	}
}
