import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { authStore } from "$lib/stores/auth.store";
import { toastService } from "$lib/services/toast.service";
import { Service, type ApiResponse, type ServiceConfig } from "./base.api";
import { CacheKind, cacheService } from "$lib/services/cache.service";

export class AuthService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> {
		const response = await this.request<RegisterResponse>("auth/register", {
			method: "POST",
			body: JSON.stringify(payload)
		});

		if (!response.success && response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
		const response = await this.request<LoginResponse>("auth/login", {
			method: "POST",
			body: JSON.stringify(payload)
		});

		if (response.success && response.data) {
			authStore.updateUser(response.data.user);
			goto(resolve("/web/dashboard"));
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async status(): Promise<ApiResponse<AuthStatusResponse>> {
		const response = await this.request<AuthStatusResponse>("auth/status");

		if (response.success && response.data?.user) {
			authStore.updateUser(response.data.user);
		} else {
			authStore.clear();
		}

		return response;
	}

	public async logout(): Promise<ApiResponse> {
		const response = await this.request("auth/logout");

		authStore.clear();
		goto(resolve("/"));

		return response;
	}

	public async updateUser(payload: Pick<Partial<RegisterPayload>, "fullName">): Promise<ApiResponse<RegisterResponse>> {
		const response = await this.request<RegisterResponse>("auth/user", {
			method: "PATCH",
			body: JSON.stringify(payload)
		});

		if (response.success && response.data) {
			authStore.updateUser(response.data);
			toastService.success("Profile updated successfully.");
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse> {
		const response = await this.request("auth/password", {
			method: "PATCH",
			body: JSON.stringify(payload)
		});

		if (response.success) {
			toastService.success("Password changed successfully.");
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async deleteAccount(): Promise<ApiResponse> {
		const response = await this.request("auth", {
			method: "DELETE"
		});

		if (response.success) {
			authStore.clear();
			goto(resolve("/"));
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async getApiKeys(): Promise<ApiResponse<GetApiKeysResponse>> {
		const response = await this.request<GetApiKeysResponse>("auth/api-keys", {
			caching: {
				kind: CacheKind.API_KEYS
			}
		});

		return response;
	}

	public async createApiKey(payload: CreateApiKeyPayload): Promise<ApiResponse<CreateApiKeyResponse>> {
		const response = await this.request<CreateApiKeyResponse>("auth/api-keys", {
			method: "POST",
			body: JSON.stringify(payload)
		});

		if (response.success) {
			cacheService.remove(CacheKind.API_KEYS);
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async updateApiKey(id: number, payload: UpdateApiKeyPayload): Promise<ApiResponse<UpdateApiKeyResponse>> {
		const response = await this.request<UpdateApiKeyResponse>(`auth/api-keys/${id}`, {
			method: "PATCH",
			body: JSON.stringify(payload)
		});

		if (response.success) {
			cacheService.remove(CacheKind.API_KEYS);
			toastService.success("API key updated successfully.");
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async deleteApiKey(id: number): Promise<ApiResponse> {
		const response = await this.request(`auth/api-keys/${id}`, {
			method: "DELETE"
		});

		if (response.success) {
			cacheService.remove(CacheKind.API_KEYS);
			toastService.success("API key deleted successfully.");
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}
}

export interface User {
	id: number;
	fullName: string;
	email: string;
}

export interface RegisterPayload {
	fullName: string;
	email: string;
	password: string;
}

export interface RegisterResponse {
	id: number;
	fullName: string;
	email: string;
}

export interface LoginPayload {
	email?: string;
	password?: string;
}
export interface LoginResponse {
	accessToken: string;
	accessTokenExpiresIn: number;
	refreshToken: string;
	refreshTokenExpiresIn: number;
	user: User;
}

export interface AuthStatusResponse {
	user: { id: number; fullName: string; email: string };
}

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}

export interface CreateApiKeyPayload {
	name: string;
}

export interface CreateApiKeyResponse {
	id: number;
	key: string;
	name: string;
	lastFour: string;
}

export interface ApiKey {
	id: number;
	name: string;
	lastFour: string;
	createdAt: string;
	lastUsedAt: string;
}

export interface GetApiKeysResponse {
	apiKeys: ApiKey[];
}

export interface UpdateApiKeyPayload {
	name: string;
}

export interface UpdateApiKeyResponse {
	id: number;
	name: string;
	lastFour: string;
}
