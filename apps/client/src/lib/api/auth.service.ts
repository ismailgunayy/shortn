import type {
	ApiResponse,
	AuthStatusResponse,
	CreateApiKeyRequest,
	CreateApiKeyResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse
} from '$lib/types/api';

import { Service } from './service';
import { config } from '$lib/common/config';

export class AuthService extends Service {
	constructor() {
		super();
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

	public async status(): Promise<ApiResponse<AuthStatusResponse>> {
		return await this.request<AuthStatusResponse>(config.api.endpoints.auth.status);
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
		return await this.request<CreateApiKeyResponse>(config.api.endpoints.auth.apiKey, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}
}
