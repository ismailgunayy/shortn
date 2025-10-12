import type { LoginForm, RegisterForm } from "$lib/schemas/auth.schema";

import { api } from "$lib/api/api.client";
import { errorStore } from "./error.store";
import { goto } from "$app/navigation";
import { writable } from "svelte/store";

export interface User {
	id: number;
	fullName: string;
	email: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user?: User;
	loading: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
	user: undefined,
	loading: true
};

const unauthenticatedState: AuthState = {
	isAuthenticated: false,
	user: undefined,
	loading: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		async register(formData: RegisterForm) {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await api.auth.register(formData);

				if (response.success) {
					const loginResult = await this.login({
						email: formData.email,
						password: formData.password
					});

					return loginResult;
				} else {
					update((state) => ({ ...state, loading: false }));
					errorStore.handleApiError(response, {
						source: "auth.register",
						action: "register_user"
					});
					return { success: false, error: response.error?.message || "Registration failed" };
				}
			} catch (err) {
				update((state) => ({ ...state, loading: false }));
				errorStore.handleNetworkError(err, {
					source: "auth.register",
					action: "register_user"
				});
				return { success: false, error: "Network error" };
			}
		},

		async login(formData: LoginForm) {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await api.auth.login(formData);

				if (response.success && response.data) {
					await this.checkStatus();
					goto("/web/dashboard");

					return { success: true };
				} else {
					update((state) => ({ ...state, loading: false }));
					errorStore.handleApiError(response, {
						source: "auth.login",
						action: "login_user"
					});
					return { success: false, error: response.error?.message || "Login failed" };
				}
			} catch (err) {
				update((state) => ({ ...state, loading: false }));
				errorStore.handleNetworkError(err, {
					source: "auth.login",
					action: "login_user"
				});
				return { success: false, error: "Network error" };
			}
		},

		async checkStatus() {
			update((state) => ({ ...state, loading: true }));

			const timeStart = Date.now();
			const minLoadingTime = 250;

			try {
				const response = await api.auth.status();

				if (response.success && response.data?.user) {
					const timeElapsed = Date.now() - timeStart;
					if (timeElapsed < minLoadingTime) {
						await new Promise((resolve) => setTimeout(resolve, minLoadingTime - timeElapsed));
					}

					return set({
						isAuthenticated: true,
						user: response.data.user,
						loading: false
					});
				} else {
					return set(unauthenticatedState);
				}
			} catch (err) {
				console.error("Auth status check failed:", err);
				errorStore.handleNetworkError(err, {
					source: "auth.checkStatus",
					action: "check_auth_status"
				});
				return set(unauthenticatedState);
			}
		},

		async refresh() {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await api.auth.refresh();

				if (response.success && response.data) {
					await this.checkStatus();
					return { success: true };
				} else {
					set(unauthenticatedState);
					errorStore.handleApiError(response, {
						source: "auth.refresh",
						action: "refresh_token"
					});
					return { success: false, error: response.error?.message || "Refresh failed" };
				}
			} catch (err) {
				set(unauthenticatedState);
				errorStore.handleNetworkError(err, {
					source: "auth.refresh",
					action: "refresh_token"
				});
				return { success: false, error: "Network error" };
			}
		},

		async updateUser(values: { fullName?: string; password?: string }) {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await api.auth.update(values);

				if (response.success && response.data) {
					update((state) => ({
						...state,
						user: response.data,
						loading: false
					}));
					errorStore.showSuccess("Account updated successfully");
					return { success: true };
				} else {
					update((state) => ({ ...state, loading: false }));
					errorStore.handleApiError(response, {
						source: "auth.updateUser",
						action: "update_user_profile"
					});
					return { success: false, error: response.error?.message || "Update failed" };
				}
			} catch (err) {
				update((state) => ({ ...state, loading: false }));
				errorStore.handleNetworkError(err, {
					source: "auth.updateUser",
					action: "update_user_profile"
				});
				return { success: false, error: "Network error" };
			}
		},

		async deleteAccount() {
			update((state) => ({ ...state, loading: true }));

			try {
				const response = await api.auth.delete();

				if (response.success) {
					set(unauthenticatedState);
					goto("/");
					errorStore.showInfo("Account deleted successfully");
					return { success: true };
				} else {
					update((state) => ({ ...state, loading: false }));
					errorStore.handleApiError(response, {
						source: "auth.deleteAccount",
						action: "delete_user_account"
					});
					return { success: false, error: response.error?.message || "Delete failed" };
				}
			} catch (err) {
				update((state) => ({ ...state, loading: false }));
				errorStore.handleNetworkError(err, {
					source: "auth.deleteAccount",
					action: "delete_user_account"
				});
				return { success: false, error: "Network error" };
			}
		},

		async logout() {
			update((state) => ({ ...state, loading: true }));

			try {
				await api.auth.logout();
			} finally {
				set(unauthenticatedState);
				await goto("/", {
					invalidateAll: true
				});
			}
		},

		clear() {
			set(unauthenticatedState);
		}
	};
}

export const authStore = createAuthStore();
