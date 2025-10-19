import { AuthService } from "./auth.api";
import { UrlService } from "./url.api";

export const clientApi = {
	auth: new AuthService(),
	url: new UrlService()
};
