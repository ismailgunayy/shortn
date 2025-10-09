import { CustomCodeAlreadyInUse, CustomUrlNotFound, InvalidShortenedUrl, UrlNotFound } from "~/errors";

import { App } from "~/types/fastify";
import { CacheType } from "./cache.service";
import { URLSegment } from "~/helpers";
import { UrlRepository } from "~/repositories/url.repository";

export class UrlService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: UrlRepository
	) {}

	private async createCustomUrl(originalUrl: string, userId: number, customCode: string) {
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

	private async createGeneratedUrl(originalUrl: string, userId: number) {
		const existingUrl = await this.urlRepository.findUrlByUrl(originalUrl, userId);

		if (existingUrl) {
			return this.app.helpers.url.buildUrl(this.app.helpers.url.encodeId(existingUrl.id));
		}

		const { id } = await this.urlRepository.insertUrl({ url: originalUrl, userId });

		const shortCode = this.app.helpers.url.encodeId(id);
		return this.app.helpers.url.buildUrl(shortCode);
	}

	public async shortenUrl(originalUrl: string, userId: number, customCode?: string) {
		const shortenedUrl = customCode
			? await this.createCustomUrl(originalUrl, userId, customCode)
			: await this.createGeneratedUrl(originalUrl, userId);

		this.app.services.cache.set(CacheType.URL, shortenedUrl, originalUrl, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 // 1 day
			}
		});

		return shortenedUrl;
	}

	public async getOriginalUrl(shortenedUrl: string) {
		const cachedUrl = await this.app.services.cache.get(CacheType.URL, shortenedUrl);
		if (cachedUrl) {
			return cachedUrl;
		}

		const shortCode = shortenedUrl.replace(this.app.config.HTTP.CLIENT_URL + "/", "");
		if (!shortCode) {
			throw new InvalidShortenedUrl();
		}

		let originalUrl;

		if (this.app.helpers.url.isCustomUrl(shortenedUrl)) {
			const customCode = shortCode.replace(`${URLSegment.Custom}/`, "");
			const existingCustom = await this.urlRepository.findCustomUrlByCustomCode(customCode);

			if (!existingCustom) {
				throw new InvalidShortenedUrl();
			}

			originalUrl = existingCustom.url;

			return existingCustom.url;
		} else {
			const id = this.app.helpers.url.decodeId(shortCode);
			const existingUrl = await this.urlRepository.findUrlById(id);

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
			shortenedUrl: this.app.helpers.url.buildUrl(this.app.helpers.url.encodeId(url.id)),
			shortCode: this.app.helpers.url.encodeId(url.id),
			createdAt: url.createdAt
		}));

		customUrls = customUrls.map((url) => ({
			id: url.id,
			originalUrl: url.url,
			shortenedUrl: this.app.helpers.url.buildUrl(url.customCode, URLSegment.Custom),
			customCode: url.customCode,
			createdAt: url.createdAt
		}));

		return {
			urls,
			customUrls
		};
	}

	public async updateCustomUrl(id: number, userId: number, originalUrl: string) {
		const url = await this.urlRepository.findCustomUrlById(id, userId);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		const updatedUrl = await this.urlRepository.updateCustomUrl(id, userId, { url: originalUrl });

		return {
			id: updatedUrl.id,
			originalUrl: updatedUrl.url,
			shortenedUrl: this.app.helpers.url.buildUrl(updatedUrl.customCode, URLSegment.Custom),
			customCode: updatedUrl.customCode,
			createdAt: updatedUrl.createdAt
		};
	}

	public async deleteUrl(id: number, userId: number, shortenedUrl: string) {
		if (this.app.helpers.url.isCustomUrl(shortenedUrl)) {
			await this.deleteCustomUrl(id, userId);
		} else {
			await this.deleteGeneratedUrl(id, userId);
		}

		this.app.services.cache.del(CacheType.URL, shortenedUrl);
	}

	private async deleteGeneratedUrl(id: number, userId: number) {
		const url = await this.urlRepository.findUrlById(id);

		if (!url || url.userId !== userId) {
			throw new UrlNotFound();
		}

		await this.urlRepository.deleteUrl(id, userId);
	}

	private async deleteCustomUrl(id: number, userId: number) {
		const url = await this.urlRepository.findCustomUrlById(id, userId);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		await this.urlRepository.deleteCustomUrl(id, userId);
	}
}
