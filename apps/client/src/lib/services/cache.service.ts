import { StorageKind, storageService, type StorageType } from "./storage.service";

export enum CacheKind {
	GENERATED_URLS = "generated_urls",
	CUSTOM_URLS = "custom_urls",
	API_KEYS = "api_keys"
}

type CacheRecord<T = unknown> = {
	timestamp: number;
	ttl: number; // milliseconds
	data: T;
};

export class CacheService {
	private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

	private generateKey(key: CacheKind): `${StorageKind.API_CACHE_PREFIX}:${CacheKind}` {
		return `${StorageKind.API_CACHE_PREFIX}:${key}`;
	}

	public get<T>(key: CacheKind): T | null {
		const storageKey = this.generateKey(key);
		const record = storageService.get<CacheRecord<T>>(storageKey);

		if (!record) {
			return null;
		}

		const isExpired = Date.now() - record.timestamp > record.ttl;

		if (isExpired) {
			storageService.remove(storageKey);
			return null;
		}

		return record.data;
	}

	public set(key: CacheKind, data: unknown, ttl: number = CacheService.DEFAULT_TTL): void {
		const record: CacheRecord = {
			timestamp: Math.floor(Date.now()),
			ttl,
			data
		};

		const storageKey = this.generateKey(key);
		storageService.set(storageKey, record);
	}

	public remove(key: CacheKind): void {
		const storageKey = this.generateKey(key);
		storageService.remove(storageKey);
	}

	public clear(): void {
		const keys = storageService.keys();

		keys.forEach((key) => {
			if (key.startsWith(StorageKind.API_CACHE_PREFIX)) {
				storageService.remove(key as StorageType);
			}
		});
	}
}

export const cacheService = new CacheService();
