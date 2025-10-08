import { Service, type ApiResponse, type ServiceConfig } from "./service";

export class AuthService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async register(values: RegisterRequest, options?: RequestInit): Promise<ApiResponse<RegisterResponse>> {
		return await this.request<RegisterResponse>("auth/register", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});
	}

	public async login(values: LoginRequest, options?: RequestInit): Promise<ApiResponse<LoginResponse>> {
		return await this.request<LoginResponse>("auth/login", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});
	}

	public async status(options?: RequestInit): Promise<ApiResponse<AuthStatusResponse>> {
		return await this.request<AuthStatusResponse>("auth", {
			...options
		});
	}

	public async refresh(options?: RequestInit): Promise<ApiResponse<LoginResponse>> {
		return await this.request<LoginResponse>("auth/refresh", {
			method: "POST",
			...options
		});
	}

	public async logout(options?: RequestInit): Promise<ApiResponse> {
		return await this.request("auth/logout", {
			...options
		});
	}

	public async update(
		values: Pick<Partial<RegisterRequest>, "fullName" | "password">,
		options?: RequestInit
	): Promise<ApiResponse<RegisterResponse>> {
		return await this.request<RegisterResponse>("auth", {
			method: "PATCH",
			body: JSON.stringify(values),
			...options
		});
	}

	public async delete(options?: RequestInit): Promise<ApiResponse> {
		return await this.request("auth", {
			method: "DELETE",
			...options
		});
	}

	public async getApiKeys(options?: RequestInit): Promise<ApiResponse<GetApiKeysResponse>> {
		return await this.request<GetApiKeysResponse>("auth/api-keys", {
			...options
		});
	}

	public async createApiKey(
		values: CreateApiKeyRequest,
		options?: RequestInit
	): Promise<ApiResponse<CreateApiKeyResponse>> {
		return await this.request<CreateApiKeyResponse>("auth/api-keys", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});
	}

	public async updateApiKey(
		id: number,
		values: UpdateApiKeyRequest,
		options?: RequestInit
	): Promise<ApiResponse<UpdateApiKeyResponse>> {
		return await this.request<UpdateApiKeyResponse>(`auth/api-keys/${id}`, {
			method: "PATCH",
			body: JSON.stringify(values),
			...options
		});
	}

	public async deleteApiKey(id: number, options?: RequestInit): Promise<ApiResponse> {
		return await this.request(`auth/api-keys/${id}`, {
			method: "DELETE",
			...options
		});
	}
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
	refreshToken: string;
	expiresIn: number;
}

export interface AuthStatusResponse {
	user: { id: number; fullName: string; email: string };
	isAuthenticated: boolean;
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
