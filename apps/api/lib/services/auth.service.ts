import {
	ApiKeyNameAlreadyInUse,
	ApiKeyNotFound,
	ApiKeyNotProvided,
	InactiveApiKey,
	InvalidApiKey,
	InvalidApiKeyFormat,
	InvalidEmailFormat,
	InvalidPasswordFormat,
	UserAlreadyExists,
	UserNotFound,
	WrongPassword
} from "~/errors";
import { ApiKeySchema, PasswordSchema } from "~/schemas/auth.schema";

import { App } from "~/types/fastify";
import { AuthRepository } from "~/repositories/auth.repository";
import z from "zod";

export enum TokenType {
	ACCESS = "accessToken",
	REFRESH = "refreshToken"
}

export class AuthService {
	constructor(
		private readonly app: App,
		private readonly authRepository: AuthRepository
	) {}

	public async register(values: { fullName: string; email: string; password: string }) {
		let { fullName, email, password } = values;

		fullName = fullName.trim();
		email = email.trim().toLowerCase();
		password = password.trim();

		const userFound = await this.authRepository.findUserByEmail(email);
		if (userFound) {
			throw new UserAlreadyExists();
		}

		const isEmailOK = z.email().safeParse(email).success;
		if (!isEmailOK) {
			throw new InvalidEmailFormat();
		}

		const isPasswordOK = PasswordSchema.safeParse(password).success;
		if (!isPasswordOK) {
			throw new InvalidPasswordFormat();
		}

		const user = await this.authRepository.insertUser({
			fullName,
			email,
			password: await this.app.helpers.auth.hashPassword(password)
		});

		return {
			id: user.id,
			fullName: user.fullName,
			email: user.email
		};
	}

	public async login(values: { email: string; password: string }) {
		let { email, password } = values;

		email = email.trim().toLowerCase();
		password = password.trim();

		const user = await this.authRepository.findUserByEmail(email);
		if (!user) {
			throw new UserNotFound();
		}

		const isPasswordMatched = await this.app.helpers.auth.verifyPassword(password, user.password);
		if (!isPasswordMatched) {
			throw new WrongPassword();
		}

		return {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

	public async me(id: number) {
		const user = await this.authRepository.findUser(id);

		if (!user) {
			throw new UserNotFound();
		}

		return {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

	public async deleteUser(id: number) {
		const user = await this.authRepository.findUser(id);

		if (!user) {
			throw new UserNotFound();
		}

		await this.authRepository.deleteUser(id);
	}

	public async getServiceAccount() {
		const serviceAccountEmail = this.app.config.AUTH.SERVICE_ACCOUNT_EMAIL;
		const serviceAccount = await this.authRepository.findUserByEmail(serviceAccountEmail);

		if (!serviceAccount) {
			throw new Error("Service account not found");
		}

		{
			return {
				id: serviceAccount.id,
				fullName: serviceAccount.fullName,
				email: serviceAccount.email,
				createdAt: serviceAccount.createdAt,
				updatedAt: serviceAccount.updatedAt
			};
		}
	}

	public async createApiKey(userId: number, name: string) {
		const existingApiKey = await this.authRepository.findApiKeyByName(userId, name);
		if (existingApiKey) {
			throw new ApiKeyNameAlreadyInUse();
		}

		const key = this.app.helpers.auth.generateApiKey();
		const lastFour = key.slice(-4);
		const keyHash = this.app.helpers.auth.hashApiKey(key);

		const apiKey = await this.authRepository.insertApiKey({
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
		const apiKeys = await this.authRepository.findAllApiKeysByUserId(userId);
		return apiKeys;
	}

	public async verifyApiKey(key?: string) {
		if (!key) {
			throw new ApiKeyNotProvided();
		}

		if (ApiKeySchema.safeParse(key).success === false) {
			throw new InvalidApiKeyFormat();
		}

		const keyHash = this.app.helpers.auth.hashApiKey(key);
		const apiKey = await this.authRepository.findApiKeyByHash(keyHash);

		if (!apiKey) {
			throw new ApiKeyNotFound();
		}

		if (!apiKey.isActive) {
			throw new InactiveApiKey();
		}

		if (keyHash !== apiKey.keyHash) {
			throw new InvalidApiKey();
		}

		await this.authRepository.updateApiKey(apiKey.id, { lastUsedAt: new Date() });

		return {
			userId: apiKey.userId
		};
	}

	public async updateApiKey(id: number, userId: number, name: string) {
		const apiKey = await this.authRepository.findApiKey(userId, id);

		if (!apiKey) {
			throw new ApiKeyNotFound();
		}

		const existingApiKey = await this.authRepository.findApiKeyByName(userId, name);
		if (existingApiKey && existingApiKey.id !== id) {
			throw new ApiKeyNameAlreadyInUse();
		}

		await this.authRepository.updateApiKey(id, { name });

		return {
			id: apiKey.id,
			name: name,
			lastFour: apiKey.lastFour
		};
	}

	public async deleteApiKey(id: number, userId: number) {
		const apiKey = await this.authRepository.findApiKey(userId, id);

		if (!apiKey) {
			throw new ApiKeyNotFound();
		}

		await this.authRepository.deleteApiKey(userId, id);
	}
}
