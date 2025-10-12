import type { LayoutServerLoad } from "./$types";
import { checkAuthStatus } from "$lib/utils/check-auth.server";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await checkAuthStatus(cookies);

	if (!user) {
		throw redirect(302, "/web/login");
	}
};
