import { SetOptions, createClient } from "redis";

import { App } from "~/types/fastify";

export enum CacheKind {
	GENERATED_URL = "generated_url",
	CUSTOM_URL = "custom_url"
}

export class CacheService {
	private client: ReturnType<typeof createClient>;

	constructor(private readonly app: App) {
		this.client = createClient({
			url: app.config.REDIS.URL,
			socket: {
				connectTimeout: 5000,
				timeout: 5000,
				reconnectStrategy: false
			}
		});

		app.addHook("onClose", async () => {
			try {
				if (this.client.isOpen) {
					await this.client.quit();
				}
			} catch {
				this.app.log.error("Error closing Cache connection");
			}
		});

		this.client.on("connect", () => {
			app.log.info("Cache Client Connected");
		});

		this.client.on("error", (err) => {
			app.log.error(err, "Cache Client Connection Error");
		});
	}

	public async connect() {
		try {
			if (!this.client.isOpen) {
				await this.client.connect();
			}
		} catch (err) {
			this.app.log.error(err, "Cache connection failed, will retry on next operation");
		}
	}

	public async get(kind: CacheKind, key: string) {
		return await this.executeOperation(async () => await this.client.get(this.generateKey(kind, key)));
	}

	public async set(kind: CacheKind, key: string, value: unknown, options?: SetOptions) {
		return await this.executeOperation(async () => {
			const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);

			return await this.client.set(this.generateKey(kind, key), strValue, options);
		});
	}

	public async del(kind: CacheKind, key: string) {
		return await this.executeOperation(async () => await this.client.del(this.generateKey(kind, key)));
	}

	private generateKey(kind: CacheKind, key: string) {
		return `${kind}:${key}`;
	}

	private async executeOperation<T>(operation: () => Promise<T>): Promise<T | null> {
		try {
			if (!this.client.isOpen) {
				await this.connect();
			}

			return await operation();
		} catch (err) {
			this.app.log.error(err, "Cache Service Error");
			return null;
		}
	}
}
