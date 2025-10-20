import type { LayoutServerLoad } from "./$types";
import { resolveAndRedirect } from "$lib/utils/redirect.util.server";

export const load: LayoutServerLoad = async ({ request }) => {
	return resolveAndRedirect(request.url);
};
