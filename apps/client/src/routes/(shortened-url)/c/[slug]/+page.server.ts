import type { PageServerLoad } from "./$types";
import { resolveAndRedirect } from "$lib/utils/resolve-url.util.server";

export const load: PageServerLoad = async ({ request }) => {
	return resolveAndRedirect(request.url);
};
