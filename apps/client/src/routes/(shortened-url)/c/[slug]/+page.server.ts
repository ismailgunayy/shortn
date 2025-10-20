import type { PageServerLoad } from "./$types";
import { config } from "$lib/common/config";
import { redirectUrl } from "$lib/utils/redirect-url.util.server";

export const load: PageServerLoad = async ({ params }) => {
	const shortenedUrl = `${config.HTTP.CLIENT_URL}/c/${params.slug}`;

	return redirectUrl(shortenedUrl);
};
