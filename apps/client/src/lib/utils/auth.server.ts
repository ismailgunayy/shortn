import type { User } from '$lib/stores/auth.store';
import { redirect } from '@sveltejs/kit';
import { serverApi } from '$lib/api/api.server';

export async function checkAuthStatus(cookie?: string): Promise<User | undefined> {
	try {
		const response = await serverApi.auth.status(cookie);

		if (response.success && response.data?.isAuthenticated && response.data?.user) {
			return response.data.user;
		}

		return;
	} catch (error) {
		console.warn('Auth status check failed:', error);
		return;
	}
}

export async function requireAuth(cookie?: string): Promise<User> {
	const user = await checkAuthStatus(cookie);

	if (!user) {
		throw redirect(302, '/web/login');
	}

	return user;
}

export async function redirectIfAuthenticated(
	redirectTo: string = '/',
	cookie?: string
): Promise<void> {
	const user = await checkAuthStatus(cookie);

	if (user) {
		throw redirect(302, redirectTo);
	}
}
