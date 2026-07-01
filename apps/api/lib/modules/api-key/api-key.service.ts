import { API_KEY_LENGTH, ApiKeySchema } from "./api-key.schema";
import {
	ApiKeyCreationLimitReached,
	ApiKeyNameAlreadyInUse,
	ApiKeyNotFound,
	ApiKeyNotProvided,
	InactiveApiKey,
	InvalidApiKeyFormat
} from "./api-key.error";

import { ApiKeyRepository } from "./api-key.repository";
import { App } from "~/types/fastify";
import crypto from "crypto";

const MAX_API_KEYS_PER_USER = 5;

export class ApiKeyService {
	constructor(
		private readonly app: App,
		private readonly apiKeyRepository: ApiKeyRepository
	) {}

	private generateApiKey() {
		return crypto.randomBytes(API_KEY_LENGTH).toString("hex");
	}

	private hashApiKey(key: string) {
		return crypto.createHash("sha256").update(key).digest("hex");
	}

	public async createApiKey(userId: number, name: string) {
		const apiKeysCount = await this.apiKeyRepository.countApiKeysByUserId(userId);

		if (apiKeysCount >= MAX_API_KEYS_PER_USER) {
			throw new ApiKeyCreationLimitReached(MAX_API_KEYS_PER_USER);
		}

		const existingApiKey = await this.apiKeyRepository.findApiKeyByName(userId, name);
		if (existingApiKey) {
			throw new ApiKeyNameAlreadyInUse();
		}

		const key = this.generateApiKey();
		const lastFour = key.slice(-4);
		const keyHash = this.hashApiKey(key);

		const apiKey = await this.apiKeyRepository.insertApiKey({
			userId,
			keyHash,
			lastFour,
			name,
			lastUsedAt: new Date()
		});

		return {
			id: apiKey.id,
			key: key,
			name: apiKey.name,
			lastFour: apiKey.lastFour
		};
	}

	public async getApiKeysOfUser(userId: number) {
		const apiKeys = await this.apiKeyRepository.findAllApiKeysByUserId(userId);
		return apiKeys;
	}

	public async verifyApiKey(key?: string) {
		if (!key) {
			throw new ApiKeyNotProvided();
		}

		if (ApiKeySchema.safeParse(key).success === false) {
			throw new InvalidApiKeyFormat();
		}

		const keyHash = this.hashApiKey(key);
		const apiKey = await this.apiKeyRepository.findApiKeyByHash(keyHash);

		if (!apiKey) {
			throw new ApiKeyNotFound();
		}

		if (!apiKey.isActive) {
			throw new InactiveApiKey();
		}

		await this.apiKeyRepository.updateApiKey(apiKey.id, apiKey.userId, { lastUsedAt: new Date() });

		return {
			userId: apiKey.userId
		};
	}

	public async updateApiKey(id: number, userId: number, name: string) {
		const apiKey = await this.apiKeyRepository.findApiKey(id, userId);

		if (!apiKey) {
			throw new ApiKeyNotFound();
		}

		const existingApiKey = await this.apiKeyRepository.findApiKeyByName(userId, name);
		if (existingApiKey && existingApiKey.id !== id) {
			throw new ApiKeyNameAlreadyInUse();
		}

		if (apiKey.name !== name) {
			await this.apiKeyRepository.updateApiKey(id, userId, { name });
		}

		return {
			id: apiKey.id,
			name: name,
			lastFour: apiKey.lastFour
		};
	}

	public async deleteApiKey(id: number, userId: number) {
		const apiKey = await this.apiKeyRepository.findApiKey(id, userId);

		if (!apiKey) {
			throw new ApiKeyNotFound();
		}

		await this.apiKeyRepository.deleteApiKey(id, userId);
	}
}
