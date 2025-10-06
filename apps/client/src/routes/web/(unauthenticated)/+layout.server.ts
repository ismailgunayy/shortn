import type { LayoutServerLoad } from "./$types";
import { redirectIfAuthenticated } from "$lib/utils/auth.server";

export const load: LayoutServerLoad = async ({ cookies }) => {
	return await redirectIfAuthenticated("/", cookies);
};
