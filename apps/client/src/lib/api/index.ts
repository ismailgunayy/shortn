import { AuthService } from './auth.service';
import { UrlService } from './url.service';

export const api = {
	auth: new AuthService(),
	url: new UrlService()
};
