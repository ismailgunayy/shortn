import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { authStore } from "$lib/stores/auth.store";
import { toastService } from "$lib/services/toast.service";
import { Service, type ApiResponse, type ServiceConfig } from "./base.api";

export class AuthService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async register(values: RegisterRequest, options?: RequestInit): Promise<ApiResponse<RegisterResponse>> {
		const response = await this.request<RegisterResponse>("auth/register", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});

		if (response.error) {
			toastService.error(`Failed to register.`);
		}

		return response;
	}

	public async login(values: LoginRequest, options?: RequestInit): Promise<ApiResponse<LoginResponse>> {
		const response = await this.request<LoginResponse>("auth/login", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});

		if (response.success && response.data) {
			authStore.updateUser(response.data.user);
			goto(resolve("/web/dashboard"));
		} else {
			toastService.error("Failed to login.");
		}

		return response;
	}

	public async status(options?: RequestInit): Promise<ApiResponse<AuthStatusResponse>> {
		const response = await this.request<AuthStatusResponse>("auth/status", {
			...options
		});

		if (response.success && response.data?.user) {
			authStore.updateUser(response.data.user);
		} else {
			authStore.clear();
		}

		return response;
	}

	public async logout(options?: RequestInit): Promise<ApiResponse> {
		const response = await this.request("auth/logout", {
			...options
		});

		authStore.clear();
		goto(resolve("/"));

		return response;
	}

	public async updateUser(
		values: Pick<Partial<RegisterRequest>, "fullName">,
		options?: RequestInit
	): Promise<ApiResponse<RegisterResponse>> {
		const response = await this.request<RegisterResponse>("auth/user", {
			method: "PATCH",
			body: JSON.stringify(values),
			...options
		});

		if (response.success && response.data) {
			authStore.updateUser(response.data);
			toastService.success("Profile updated successfully.");
		} else {
			toastService.error("Failed to update profile.");
		}

		return response;
	}

	public async changePassword(values: ChangePasswordRequest, options?: RequestInit): Promise<ApiResponse> {
		const response = await this.request("auth/password", {
			method: "PATCH",
			body: JSON.stringify(values),
			...options
		});

		if (response.success) {
			toastService.success("Password changed successfully.");
		} else {
			toastService.error("Failed to change password.");
		}

		return response;
	}

	public async deleteAccount(options?: RequestInit): Promise<ApiResponse> {
		const response = await this.request("auth", {
			method: "DELETE",
			...options
		});

		if (response.success) {
			authStore.clear();
			goto(resolve("/"));
		} else {
			toastService.error("Failed to delete account.");
		}

		return response;
	}

	public async getApiKeys(options?: RequestInit): Promise<ApiResponse<GetApiKeysResponse>> {
		const response = await this.request<GetApiKeysResponse>("auth/api-keys", {
			...options
		});

		return response;
	}

	public async createApiKey(
		values: CreateApiKeyRequest,
		options?: RequestInit
	): Promise<ApiResponse<CreateApiKeyResponse>> {
		const response = await this.request<CreateApiKeyResponse>("auth/api-keys", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});

		if (response.error) {
			toastService.error("Failed to create API key.");
		}

		return response;
	}

	public async updateApiKey(
		id: number,
		values: UpdateApiKeyRequest,
		options?: RequestInit
	): Promise<ApiResponse<UpdateApiKeyResponse>> {
		const response = await this.request<UpdateApiKeyResponse>(`auth/api-keys/${id}`, {
			method: "PATCH",
			body: JSON.stringify(values),
			...options
		});

		if (response.success) {
			toastService.success("API key updated successfully.");
		} else {
			toastService.error("Failed to update API key.");
		}

		return response;
	}

	public async deleteApiKey(id: number, options?: RequestInit): Promise<ApiResponse> {
		const response = await this.request(`auth/api-keys/${id}`, {
			method: "DELETE",
			...options
		});

		if (response.success) {
			toastService.success("API key deleted successfully.");
		} else {
			toastService.error("Failed to delete API key.");
		}

		return response;
	}
}

export interface User {
	id: number;
	fullName: string;
	email: string;
}

export interface RegisterRequest {
	fullName: string;
	email: string;
	password: string;
}

export interface RegisterResponse {
	id: number;
	fullName: string;
	email: string;
}

export interface LoginRequest {
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

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface CreateApiKeyRequest {
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

export interface UpdateApiKeyRequest {
	name: string;
}

export interface UpdateApiKeyResponse {
	id: number;
	name: string;
	lastFour: string;
}
