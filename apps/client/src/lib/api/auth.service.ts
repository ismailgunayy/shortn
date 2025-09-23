import type {
	ApiResponse,
	AuthStatusResponse,
	CreateApiKeyRequest,
	CreateApiKeyResponse,
	GetApiKeysResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
	UpdateApiKeyRequest,
	UpdateApiKeyResponse
} from '$lib/types/api.types';

import { Service, type ServiceConfig } from './service';
import { config } from '$lib/common/config';
import type { Cookies } from '@sveltejs/kit';

export class AuthService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async register(values: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
		return await this.request<RegisterResponse>(config.api.endpoints.auth.register, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}

	public async login(values: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return await this.request<LoginResponse>(config.api.endpoints.auth.login, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}

	public async status(cookies?: Cookies): Promise<ApiResponse<AuthStatusResponse>> {
		return await this.request<AuthStatusResponse>(config.api.endpoints.auth.status, {
			headers: {
				...(cookies && {
					Cookie: cookies
						.getAll()
						.map((c) => `${c.name}=${c.value}`)
						.join('; ')
				})
			}
		});
	}

	public async refresh(): Promise<ApiResponse<LoginResponse>> {
		return await this.request<LoginResponse>(config.api.endpoints.auth.refresh, {
			method: 'POST'
		});
	}

	public async logout(): Promise<ApiResponse> {
		return await this.request(config.api.endpoints.auth.logout);
	}

	public async createApiKey(
		values: CreateApiKeyRequest
	): Promise<ApiResponse<CreateApiKeyResponse>> {
		return await this.request<CreateApiKeyResponse>(config.api.endpoints.auth.apiKeys, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}

	public async getApiKeys(): Promise<ApiResponse<GetApiKeysResponse>> {
		return await this.request<GetApiKeysResponse>(config.api.endpoints.auth.apiKeys);
	}

	public async updateApiKey(
		id: number,
		values: UpdateApiKeyRequest
	): Promise<ApiResponse<UpdateApiKeyResponse>> {
		return await this.request<UpdateApiKeyResponse>(`${config.api.endpoints.auth.apiKeys}/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(values)
		});
	}

	public async deleteApiKey(id: number): Promise<ApiResponse> {
		return await this.request(`${config.api.endpoints.auth.apiKeys}/${id}`, {
			method: 'DELETE'
		});
	}
}
