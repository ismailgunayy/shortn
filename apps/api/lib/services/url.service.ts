import {
	CannotCreateCustomUrlWithServiceAccount,
	CustomCodeAlreadyInUse,
	CustomUrlNotFound,
	InvalidShortenedUrl,
	UrlNotFound
} from "~/errors";
import { CustomUrlQuerySchema, UrlQuerySchema } from "~/schemas/url.schema";

import { App } from "~/types/fastify";
import { CacheKind } from "./cache.service";
import { URLSegment } from "~/helpers";
import { UrlRepository } from "~/repositories/url.repository";
import z from "zod";

const GENERATED_URL_EXPIRY = 60 * 60 * 24; // 1 day
const CUSTOM_URL_EXPIRY = 60 * 60 * 24 * 7; // 7 days

export class UrlService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: UrlRepository
	) {}

	private async createCustomUrl(originalUrl: string, userId: number, userEmail: string, customCode: string) {
		if (userEmail === this.app.config.AUTH.SERVICE_ACCOUNT_EMAIL) {
			throw new CannotCreateCustomUrlWithServiceAccount();
		}

		const existingCustom = await this.urlRepository.findCustomUrlByCustomCode(customCode);

		if (existingCustom) {
			throw new CustomCodeAlreadyInUse();
		}

		await this.urlRepository.insertCustomUrl({
			url: originalUrl,
			customCode,
			userId
		});

		this.app.services.cache.set(CacheKind.CUSTOM_URL, customCode, originalUrl, {
			expiration: {
				type: "EX",
				value: CUSTOM_URL_EXPIRY
			}
		});

		return this.app.helpers.url.buildUrl(customCode, URLSegment.CUSTOM);
	}

	private async createGeneratedUrl(originalUrl: string, userId: number) {
		const existingUrl = await this.urlRepository.findGeneratedUrlByUrl(originalUrl, userId);

		if (existingUrl) {
			return this.app.helpers.url.buildUrl(this.app.helpers.url.encodeId(existingUrl.id));
		}

		const { id } = await this.urlRepository.insertGeneratedUrl({ url: originalUrl, userId });

		const shortCode = this.app.helpers.url.encodeId(id);

		this.app.services.cache.set(CacheKind.GENERATED_URL, shortCode, originalUrl, {
			expiration: {
				type: "EX",
				value: GENERATED_URL_EXPIRY
			}
		});

		return this.app.helpers.url.buildUrl(shortCode);
	}

	public async shortenUrl(originalUrl: string, userId: number, userEmail: string, customCode?: string) {
		const shortenedUrl = customCode
			? await this.createCustomUrl(originalUrl, userId, userEmail, customCode)
			: await this.createGeneratedUrl(originalUrl, userId);

		return shortenedUrl;
	}

	public async getOriginalUrl(shortenedUrl: string) {
		const { shortCode, isCustom } = this.app.helpers.url.parseShortenedUrl(shortenedUrl);

		if (isCustom) {
			const customCode = shortCode;

			const cachedUrl = await this.app.services.cache.get(CacheKind.CUSTOM_URL, customCode);
			if (cachedUrl) {
				return cachedUrl;
			}

			const existingCustom = await this.urlRepository.findCustomUrlByCustomCode(customCode);

			if (!existingCustom) {
				throw new InvalidShortenedUrl();
			}

			return existingCustom.url;
		} else {
			const cachedUrl = await this.app.services.cache.get(CacheKind.GENERATED_URL, shortCode);
			if (cachedUrl) {
				return cachedUrl;
			}

			const id = this.app.helpers.url.decodeId(shortCode);
			const existingUrl = await this.urlRepository.findGeneratedUrlById(id);

			if (!existingUrl) {
				throw new InvalidShortenedUrl();
			}

			return existingUrl.url;
		}
	}

	public async getGeneratedUrlsOfUser(urlQuery: z.infer<typeof UrlQuerySchema>, userId: number) {
		const urls = await this.urlRepository.findAllGeneratedUrlsByUserId(urlQuery, userId);

		return urls.map((url) => ({
			id: url.id,
			originalUrl: url.url,
			shortenedUrl: this.app.helpers.url.buildUrl(this.app.helpers.url.encodeId(url.id)),
			shortCode: this.app.helpers.url.encodeId(url.id),
			createdAt: url.createdAt
		}));
	}

	public async countGeneratedUrlsOfUser(search: string | undefined, userId: number) {
		return await this.urlRepository.countGeneratedUrlsByUserId(search, userId);
	}

	public async getCustomUrlsOfUser(urlQuery: z.infer<typeof CustomUrlQuerySchema>, userId: number) {
		const customUrls = await this.urlRepository.findAllCustomUrlsByUserId(urlQuery, userId);

		return customUrls.map((url) => ({
			id: url.id,
			originalUrl: url.url,
			shortenedUrl: this.app.helpers.url.buildUrl(url.customCode, URLSegment.CUSTOM),
			customCode: url.customCode,
			createdAt: url.createdAt
		}));
	}

	public async countCustomUrlsOfUser(search: string | undefined, userId: number) {
		return await this.urlRepository.countCustomUrlsByUserId(search, userId);
	}

	public async updateCustomUrl(id: number, userId: number, originalUrl: string) {
		const url = await this.urlRepository.findCustomUrlById(id, userId);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		const updatedUrl = await this.urlRepository.updateCustomUrl(id, userId, { url: originalUrl });
		await this.app.services.cache.set(CacheKind.CUSTOM_URL, updatedUrl.customCode, originalUrl);

		return {
			id: updatedUrl.id,
			originalUrl: updatedUrl.url,
			shortenedUrl: this.app.helpers.url.buildUrl(updatedUrl.customCode, URLSegment.CUSTOM),
			customCode: updatedUrl.customCode,
			createdAt: updatedUrl.createdAt
		};
	}

	public async deleteUrl(id: number, userId: number, shortenedUrl: string) {
		const { shortCode, isCustom } = this.app.helpers.url.parseShortenedUrl(shortenedUrl);

		if (isCustom) {
			const customCode = shortCode;

			await this.deleteCustomUrl(id, userId);
			await this.app.services.cache.del(CacheKind.CUSTOM_URL, customCode);
		} else {
			await this.deleteGeneratedUrl(id, userId);
			await this.app.services.cache.del(CacheKind.GENERATED_URL, shortCode);
		}
	}

	private async deleteGeneratedUrl(id: number, userId: number) {
		const url = await this.urlRepository.findGeneratedUrlById(id);

		if (!url || url.userId !== userId) {
			throw new UrlNotFound();
		}

		await this.urlRepository.deleteGeneratedUrl(id, userId);
	}

	private async deleteCustomUrl(id: number, userId: number) {
		const url = await this.urlRepository.findCustomUrlById(id, userId);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		await this.urlRepository.deleteCustomUrl(id, userId);
	}
}
