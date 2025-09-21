import { redirect } from '@sveltejs/kit';
import { serverApi } from '$lib/api';

export interface AuthUser {
	id: number;
	fullName: string;
	email: string;
}

export async function checkAuthStatus(): Promise<AuthUser | null> {
	try {
		const response = await serverApi.auth.status();

		if (response.success && response.data?.isAuthenticated && response.data?.user) {
			return response.data.user;
		}

		return null;
	} catch (error) {
		console.warn('Auth status check failed:', error);

		throw redirect(302, '/web/login');
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
