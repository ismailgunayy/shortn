import type { AuthState } from '$lib/types/api';
import { writable } from 'svelte/store';

const createAuthStore = () => {
	const initialState: AuthState = {
		accessToken: null,
		expiresIn: null
	};

	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		set,
		update,
		getAccessToken: (): string | null => {
			let token: string | null = null;

			update((state) => {
				token = state.accessToken;
				return state;
			});

			return token;
		}
	};
};

export const authStore = createAuthStore();
