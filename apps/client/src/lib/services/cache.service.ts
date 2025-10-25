import { StorageKind, storageService, type StorageType } from "./storage.service";

export enum CacheKind {
	GENERATED_URLS = "generated_urls",
	CUSTOM_URLS = "custom_urls",
	API_KEYS = "api_keys"
}

type CacheType = CacheKind | `${CacheKind}:${string}`;

type CacheRecord<T = unknown> = {
	timestamp: number;
	ttl: number; // milliseconds
	data: T;
};

export class CacheService {
	private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

	private generateKey(type: CacheType, key?: string): `${StorageKind.API_CACHE_PREFIX}:${CacheType}` {
		let baseKey = `${StorageKind.API_CACHE_PREFIX}:${type}`;

		if (key) {
			baseKey = `${baseKey}:${key}`;
		}

		return baseKey as `${StorageKind.API_CACHE_PREFIX}:${CacheType}`;
	}

	public get<T>(type: CacheType, key: string): T | null {
		const storageKey = this.generateKey(type, key);
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

	public set(type: CacheType, key: string, data: unknown, ttl: number = CacheService.DEFAULT_TTL): void {
		const record: CacheRecord = {
			timestamp: Math.floor(Date.now()),
			ttl,
			data
		};

		const storageKey = this.generateKey(type, key);
		storageService.set(storageKey, record);
	}

	public remove(type: CacheType): void {
		const storageKey = this.generateKey(type);
		const keys = storageService.keys();

		keys.forEach((key) => {
			if (key.startsWith(storageKey)) {
				storageService.remove(key as StorageType);
			}
		});
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
