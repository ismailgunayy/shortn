import { api } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export interface AuthUser {
	id: number;
	fullName: string;
	email: string;
}

export async function checkAuthStatus(): Promise<AuthUser | undefined> {
	try {
		const response = await api.auth.status();

		if (response.success && response.data?.isAuthenticated && response.data?.user) {
			return response.data.user;
		}

		return;
	} catch (error) {
		console.warn('Auth status check failed:', error);
		return;
	}
}

export async function requireAuth(): Promise<AuthUser> {
	const user = await checkAuthStatus();

	if (!user) {
		throw redirect(302, '/web/login');
	}

	return user;
}

export async function redirectIfAuthenticated(redirectTo: string = '/'): Promise<void> {
	const user = await checkAuthStatus();

	if (user) {
		throw redirect(302, redirectTo);
	}
}
