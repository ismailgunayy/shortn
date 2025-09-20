import { CacheConnectionError, CacheServiceError } from "~/errors";
import { SetOptions, createClient } from "redis";

import { App } from "~/types/fastify";

export enum CacheType {
	REFRESH = "refresh",
	URL = "url"
}

export class CacheService {
	private client: ReturnType<typeof createClient>;

	constructor(private readonly app: App) {
		this.client = createClient({
			url: app.config.REDIS.URL,
			socket: {
				connectTimeout: 5000
			}
		});

		app.addHook("onClose", async () => {
			try {
				if (this.client.isOpen) {
					await this.client.quit();
				}
			} catch {
				this.app.log.error("Error closing Redis connection");
			}
		});

		this.client.on("connect", () => {
			app.log.info("Cache Client Connected");
		});

		this.client.on("error", (err) => {
			app.log.error("Redis connection error:", err);
		});
	}

	public async connect() {
		try {
			if (!this.client.isOpen) {
				await this.client.connect();
			}
		} catch (err) {
			throw new CacheConnectionError(err);
		}
	}

	public async get(type: CacheType, key: string) {
		return await this.executeOperation(async () => await this.client.get(this.generateKey(type, key)));
	}

	public async set(type: CacheType, key: string, value: unknown, options?: SetOptions) {
		return await this.executeOperation(async () => {
			const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);

			return await this.client.set(this.generateKey(type, key), strValue, options);
		});
	}

	public async del(type: CacheType, key: string) {
		return await this.executeOperation(async () => await this.client.del(this.generateKey(type, key)));
	}

	private generateKey(type: CacheType, key: string) {
		return `${type}:${key}`;
	}

	private async executeOperation<T>(operation: () => Promise<T>): Promise<T> {
		try {
			if (!this.client.isOpen) {
				await this.client.connect();
			}

			return await operation();
		} catch (err) {
			throw new CacheServiceError(err);
		}
	}
}
