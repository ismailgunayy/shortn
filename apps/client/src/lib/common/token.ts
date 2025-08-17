import { browser } from '$app/environment';

const TOKEN_STORAGE_KEY = 'shortn_auth_token';
const TOKEN_EXPIRY_KEY = 'shortn_token_expiry';

export const tokenManager = {
	get: (): string | null => {
		if (!browser) return null;
		return localStorage.getItem(TOKEN_STORAGE_KEY);
	},

	set: (token: string, expiresIn: string): void => {
		if (!browser) return;
		localStorage.setItem(TOKEN_STORAGE_KEY, token);
		localStorage.setItem(TOKEN_EXPIRY_KEY, expiresIn);
	},

	remove: (): void => {
		if (!browser) return;
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		localStorage.removeItem(TOKEN_EXPIRY_KEY);
	},

	getExpiry: (): string | null => {
		if (!browser) return null;
		return localStorage.getItem(TOKEN_EXPIRY_KEY);
	}
};
