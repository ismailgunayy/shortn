import { DB } from "~/types/db-schema";
import { Kysely } from "kysely";

export class URLRepository {
	constructor(private db: Kysely<DB>) {}

	async insert(url: string) {
		await this.db.insertInto("shortn.urls").values({ url }).executeTakeFirstOrThrow();
	}

	async findById(id: number) {
		await this.db.selectFrom("shortn.urls").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
	}
}
