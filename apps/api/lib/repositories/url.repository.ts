import { DB } from "~/types/db-schema";
import { Kysely } from "kysely";

export class URLRepository {
	constructor(private db: Kysely<DB>) {}

	async insert(url: string) {
		return await this.db.insertInto("shortn.urls").values({ url }).returning("id").executeTakeFirstOrThrow();
	}

	async findById(id: number) {
		return await this.db.selectFrom("shortn.urls").select("url").where("id", "=", id).executeTakeFirstOrThrow();
	}
}
