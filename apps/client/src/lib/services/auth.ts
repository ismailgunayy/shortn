import { apiService } from '$lib/services/api';
import { authStore } from '$lib/stores/auth';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { tokenManager } from '$lib/common/token';

class AuthService {
	init() {
		const token = tokenManager.get();
		const expiresIn = tokenManager.getExpiry();

		if (token && expiresIn) {
			authStore.setAuth(token, expiresIn);
		}
	}

	async authenticate() {
		authStore.setLoading(true);

		try {
			const response = await apiService.authenticate();

			if (response.data) {
				const { accessToken, expiresIn } = response.data;

				tokenManager.set(accessToken, expiresIn);
				authStore.setAuth(accessToken, expiresIn);

				return { success: true };
			}

			return { success: false, error: response.error || 'Authentication failed' };
		} catch (error) {
			authStore.setLoading(false);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'An error occurred during authentication'
			};
		}
	}

	logout() {
		tokenManager.remove();
		authStore.clearAuth();
	}

	clearToken() {
		this.logout();
	}

	getToken(): string | null {
		const currentAuth = get(authStore);
		return currentAuth.token || tokenManager.get();
	}

	isAuthenticated(): boolean {
		const currentAuth = get(authStore);
		return currentAuth.isAuthenticated || Boolean(tokenManager.get());
	}
}

export const authService = new AuthService();

if (browser) {
	authService.init();
}

export const auth = authStore;
export const isAuthenticated = () => authService.isAuthenticated();
export const getToken = () => authService.getToken();
