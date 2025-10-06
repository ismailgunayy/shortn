import { AuthService } from "./services/auth.service";
import { UrlService } from "./services/url.service";

export const api = {
	auth: new AuthService(),
	url: new UrlService()
};
