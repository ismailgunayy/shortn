import {
	CannotCreateCustomUrlWithServiceAccount,
	CustomCodeAlreadyInUse,
	CustomUrlNotFound,
	InvalidShortenedUrl,
	UrlNotFound
} from "./url.error";
import { CustomUrlQuerySchema, UrlQuerySchema } from "~/modules/url/url.schema";

import { App } from "~/types/fastify";
import { CacheKind } from "~/modules/cache/cache.service";
import { UrlRepository } from "~/modules/url/url.repository";
import z from "zod";

const GENERATED_URL_EXPIRY = 60 * 60 * 24; // 1 day
const CUSTOM_URL_EXPIRY = 60 * 60 * 24 * 7; // 7 days

const BASE = 62;
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
enum URLSegment {
	CUSTOM = "c"
}

export class UrlService {
	constructor(
		private readonly app: App,
		private readonly urlRepository: UrlRepository
	) {}

	private encodeId = (num: number): string => {
		if (num === 0) return "0";
		if (num < 0) return "";

		let result = "";

		while (num > 0) {
			result = BASE62_ALPHABET[num % BASE] + result;
			num = Math.floor(num / BASE);
		}

		return result;
	};

	private decodeId = (str: string): number => {
		if (!str) return 0;

		let result = 0;
		const length = str.length;

		for (let i = 0; i < length; i++) {
			const char = str[i];
			if (!char) return 0;

			const index = BASE62_ALPHABET.indexOf(char);
			if (index === -1) return 0;

			result += index * Math.pow(BASE, length - 1 - i);
		}

		return result;
	};

	private buildUrl(shortCode: string, segment?: URLSegment) {
		if (segment === URLSegment.CUSTOM) {
			return `${this.app.config.HTTP.CLIENT_URL}/${URLSegment.CUSTOM}/${shortCode}`;
		}

		return `${this.app.config.HTTP.CLIENT_URL}/${shortCode}`;
	}

	private parseShortenedUrl(shortenedUrl: string) {
		let path,
			isCustom = false;

		path = shortenedUrl.replace(this.app.config.HTTP.CLIENT_URL + "/", "");

		if (!path) {
			throw new InvalidShortenedUrl();
		}

		if (path.startsWith(`${URLSegment.CUSTOM}/`)) {
			isCustom = true;
			path = path.replace(`${URLSegment.CUSTOM}/`, "");
		}

		return {
			isCustom,
			shortCode: path
		};
	}

	private async createCustomUrl(originalUrl: string, userId: number, customCode: string, isServiceAccount?: boolean) {
		if (isServiceAccount) {
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

		return this.buildUrl(customCode, URLSegment.CUSTOM);
	}

	private async createGeneratedUrl(originalUrl: string, userId: number) {
		const existingUrl = await this.urlRepository.findGeneratedUrlByUrl(originalUrl, userId);

		if (existingUrl) {
			return this.buildUrl(this.encodeId(existingUrl.id));
		}

		const { id } = await this.urlRepository.insertGeneratedUrl({ url: originalUrl, userId });

		const shortCode = this.encodeId(id);

		this.app.services.cache.set(CacheKind.GENERATED_URL, shortCode, originalUrl, {
			expiration: {
				type: "EX",
				value: GENERATED_URL_EXPIRY
			}
		});

		return this.buildUrl(shortCode);
	}

	public async shortenUrl(originalUrl: string, userId: number, customCode?: string, isServiceAccount?: boolean) {
		const shortenedUrl = customCode
			? await this.createCustomUrl(originalUrl, userId, customCode, isServiceAccount)
			: await this.createGeneratedUrl(originalUrl, userId);

		return shortenedUrl;
	}

	public async getOriginalUrl(shortenedUrl: string) {
		const { shortCode, isCustom } = this.parseShortenedUrl(shortenedUrl);

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

			const id = this.decodeId(shortCode);
			const existingUrl = await this.urlRepository.findGeneratedUrl(id);

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
			shortenedUrl: this.buildUrl(this.encodeId(url.id)),
			shortCode: this.encodeId(url.id),
			createdAt: url.createdAt
		}));
	}

	public async countGeneratedUrlsOfUser(search: string | undefined, userId: number) {
		return await this.urlRepository.countGeneratedUrlsByUserId(userId, search);
	}

	public async getCustomUrlsOfUser(urlQuery: z.infer<typeof CustomUrlQuerySchema>, userId: number) {
		const customUrls = await this.urlRepository.findAllCustomUrlsByUserId(urlQuery, userId);

		return customUrls.map((url) => ({
			id: url.id,
			originalUrl: url.url,
			shortenedUrl: this.buildUrl(url.customCode, URLSegment.CUSTOM),
			customCode: url.customCode,
			createdAt: url.createdAt
		}));
	}

	public async countCustomUrlsOfUser(search: string | undefined, userId: number) {
		return await this.urlRepository.countCustomUrlsByUserId(userId, search);
	}

	public async updateCustomUrl(id: number, userId: number, originalUrl: string) {
		const url = await this.urlRepository.findCustomUrl(id, userId);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		const updatedUrl = await this.urlRepository.updateCustomUrl(id, userId, { url: originalUrl });
		await this.app.services.cache.set(CacheKind.CUSTOM_URL, updatedUrl.customCode, originalUrl);

		return {
			id: updatedUrl.id,
			originalUrl: updatedUrl.url,
			shortenedUrl: this.buildUrl(updatedUrl.customCode, URLSegment.CUSTOM),
			customCode: updatedUrl.customCode,
			createdAt: updatedUrl.createdAt
		};
	}

	public async deleteUrl(id: number, userId: number, shortenedUrl: string) {
		const { shortCode, isCustom } = this.parseShortenedUrl(shortenedUrl);

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
		const url = await this.urlRepository.findGeneratedUrl(id);

		if (!url || url.userId !== userId) {
			throw new UrlNotFound();
		}

		await this.urlRepository.deleteGeneratedUrl(id, userId);
	}

	private async deleteCustomUrl(id: number, userId: number) {
		const url = await this.urlRepository.findCustomUrl(id, userId);

		if (!url || url.userId !== userId) {
			throw new CustomUrlNotFound();
		}

		await this.urlRepository.deleteCustomUrl(id, userId);
	}
}
