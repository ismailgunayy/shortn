import type { AuthState } from '$lib/types';
import { writable } from 'svelte/store';

const createAuthStore = () => {
	const initialState: AuthState = {
		token: null,
		expiresIn: null,
		isAuthenticated: false,
		isLoading: false
	};

	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		set,
		update,
		setLoading: (loading: boolean) => update((state) => ({ ...state, isLoading: loading })),
		setAuth: (token: string, expiresIn: string) =>
			update((state) => ({
				...state,
				token,
				expiresIn,
				isAuthenticated: true,
				isLoading: false
			})),
		clearAuth: () =>
			update((state) => ({
				...state,
				token: null,
				expiresIn: null,
				isAuthenticated: false,
				isLoading: false
			}))
	};
};

export const authStore = createAuthStore();
