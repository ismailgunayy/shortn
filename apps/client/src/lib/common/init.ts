import { authService } from '$lib/services/auth';

export async function initializeApp(): Promise<{ success: boolean; error?: string }> {
	try {
		// Test authentication
		const authResult = await authService.authenticate();

		if (authResult.success) {
			return { success: true };
		} else {
			return { success: false };
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown initialization error';
		console.error('App initialization failed:', message);
		return { success: false, error: message };
	}
}
