import type { LoginForm, RegisterForm } from '$lib/schemas/auth.schema';

import { clientApi } from '$lib/api';
import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

interface User {
	id: number;
	fullName: string;
	email: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	loading: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	loading: true
};

const unauthenticatedState: AuthState = {
	isAuthenticated: false,
	user: null,
	loading: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		async checkStatus() {
			update((state) => ({ ...state, loading: true }));

			const timeStart = Date.now();
			const minLoadingTime = 250;

			try {
				const response = await clientApi.auth.status();

				if (response.success && response.data?.user) {
					const timeElapsed = Date.now() - timeStart;
					if (timeElapsed < minLoadingTime) {
						await new Promise((resolve) => setTimeout(resolve, minLoadingTime - timeElapsed));
					}

					set({
						isAuthenticated: true,
						user: response.data.user,
						loading: false
					});
				} else {
					set(unauthenticatedState);
				}
			} catch (error) {
				console.error('Auth status check failed:', error);
				set(unauthenticatedState);
			}
		},

		async login(formData: LoginForm) {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await clientApi.auth.login(formData);

				if (response.success && response.data) {
					await this.checkStatus();
					goto('/');

					return { success: true };
				} else {
					update((state) => ({ ...state, loading: false }));

					return { success: false, error: response.error?.message || 'Login failed' };
				}
			} catch {
				update((state) => ({ ...state, loading: false }));
				return { success: false, error: 'Network error' };
			}
		},

		async register(formData: RegisterForm) {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await clientApi.auth.register(formData);

				if (response.success) {
					const loginResult = await this.login({
						email: formData.email,
						password: formData.password
					});

					return loginResult;
				} else {
					update((state) => ({ ...state, loading: false }));

					return { success: false, error: response.error?.message || 'Registration failed' };
				}
			} catch {
				update((state) => ({ ...state, loading: false }));
				return { success: false, error: 'Network error' };
			}
		},

		async logout() {
			update((state) => ({ ...state, loading: true }));

			try {
				await clientApi.auth.logout();
			} finally {
				set(unauthenticatedState);
				goto('/');
			}
		}
	};
}

export const authStore = createAuthStore();
