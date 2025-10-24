import { StorageKind, storageService } from "$lib/services/storage.service";

import type { User } from "$lib/services/api/auth.api";
import { cacheService } from "$lib/services/cache.service";
import { writable } from "svelte/store";

interface AuthState {
	user?: User;
	loading: boolean;
}

const initialState: AuthState = {
	user: undefined,
	loading: true
};

const unauthenticatedState: AuthState = {
	user: undefined,
	loading: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		loading: () => {
			update((state) => ({ ...state, loading: true }));
		},

		loaded: () => {
			update((state) => ({ ...state, loading: false }));
		},

		updateUser(user: User) {
			storageService.set(StorageKind.AUTH_USER, user);
			update((state) => ({ ...state, user, loading: false }));
		},

		setAuthenticatedFromTokens() {
			const storedUser = storageService.get<User>(StorageKind.AUTH_USER);
			if (storedUser) {
				this.updateUser(storedUser);
			} else {
				this.clear();
			}
		},

		clear() {
			storageService.clear();
			cacheService.clear();
			set(unauthenticatedState);
		}
	};
}

export const authStore = createAuthStore();
