import { DB, ShortnCustomUrls, ShortnUrls } from "~/types/db";
import { Insertable, Kysely, Updateable } from "kysely";

export class UrlRepository {
	constructor(private db: Kysely<DB>) {}

	async insertUrl(values: Insertable<ShortnUrls>) {
		return await this.db.insertInto("shortn.urls").values(values).returning(["id"]).executeTakeFirstOrThrow();
	}

	async updateUrl(id: number, values: Updateable<ShortnUrls>) {
		return await this.db.updateTable("shortn.urls").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteUrl(id: number) {
		return await this.db.deleteFrom("shortn.urls").where("id", "=", id).execute();
	}

	async findUrlById(id: number) {
		return await this.db.selectFrom("shortn.urls").select("url").where("id", "=", id).executeTakeFirst();
	}

	async findUrlByUrl(url: string) {
		return await this.db.selectFrom("shortn.urls").selectAll().where("url", "=", url).executeTakeFirst();
	}

	async findAllUrlsByUserId(userId: number) {
		return await this.db.selectFrom("shortn.urls").selectAll().where("userId", "=", userId).execute();
	}

	async insertCustomUrl(values: Insertable<ShortnCustomUrls>) {
		return await this.db.insertInto("shortn.customUrls").values(values).returning(["id"]).executeTakeFirstOrThrow();
	}

	async updateCustomUrl(id: number, values: Updateable<ShortnCustomUrls>) {
		return await this.db.updateTable("shortn.customUrls").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteCustomUrl(id: number) {
		return await this.db.deleteFrom("shortn.customUrls").where("id", "=", id).execute();
	}

	async findCustomUrlByCustomCode(customCode: string) {
		return await this.db
			.selectFrom("shortn.customUrls")
			.select("url")
			.where("customCode", "=", customCode)
			.executeTakeFirst();
	}

	async findAllCustomUrlsByUserId(userId: number) {
		return await this.db.selectFrom("shortn.customUrls").selectAll().where("userId", "=", userId).execute();
	}
}
