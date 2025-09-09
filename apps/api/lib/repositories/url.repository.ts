import { Insertable, Kysely } from "kysely";

import { DB } from "~/types/db";

export class UrlRepository {
	constructor(private db: Kysely<DB>) {}

	async insert(values: Insertable<DB["shortn.urls"]>) {
		return await this.db.insertInto("shortn.urls").values(values).returning("id").executeTakeFirstOrThrow();
	}

	async findById(id: number) {
		return await this.db.selectFrom("shortn.urls").select("url").where("id", "=", id).executeTakeFirstOrThrow();
	}
}
