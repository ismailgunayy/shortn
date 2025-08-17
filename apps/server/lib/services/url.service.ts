import { URLRepository } from "~/repositories/url.repository";

export class URLService {
	constructor(private readonly urlRepository: URLRepository) {}

	async shortenUrl(url: string) {
		await this.urlRepository.insert(url);
	}

	async getOriginalUrl(id: number) {
		return await this.urlRepository.findById(id);
	}
}
