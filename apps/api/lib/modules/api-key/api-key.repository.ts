import { DB, ShortnApiKeys } from "~/types/db";
import { Insertable, Kysely, SelectType, Updateable } from "kysely";

export class ApiKeyRepository {
	constructor(private db: Kysely<DB>) {}

	async insertApiKey(values: Insertable<ShortnApiKeys>) {
		return await this.db.insertInto("shortn.apiKeys").values(values).returningAll().executeTakeFirstOrThrow();
	}

	async updateApiKey(
		id: SelectType<ShortnApiKeys["id"]>,
		userId: SelectType<ShortnApiKeys["userId"]>,
		values: Updateable<ShortnApiKeys>
	) {
		return await this.db
			.updateTable("shortn.apiKeys")
			.set(values)
			.where("id", "=", id)
			.where("userId", "=", userId)
			.executeTakeFirstOrThrow();
	}

	async deleteApiKey(id: SelectType<ShortnApiKeys["id"]>, userId: SelectType<ShortnApiKeys["userId"]>) {
		return await this.db.deleteFrom("shortn.apiKeys").where("userId", "=", userId).where("id", "=", id).execute();
	}

	async findApiKey(id: SelectType<ShortnApiKeys["id"]>, userId: SelectType<ShortnApiKeys["userId"]>) {
		return await this.db
			.selectFrom("shortn.apiKeys")
			.selectAll()
			.where("userId", "=", userId)
			.where("id", "=", id)
			.executeTakeFirst();
	}

	async findApiKeyByHash(keyHash: SelectType<ShortnApiKeys["keyHash"]>) {
		return await this.db.selectFrom("shortn.apiKeys").selectAll().where("keyHash", "=", keyHash).executeTakeFirst();
	}

	async findApiKeyByName(userId: SelectType<ShortnApiKeys["userId"]>, name: SelectType<ShortnApiKeys["name"]>) {
		return await this.db
			.selectFrom("shortn.apiKeys")
			.selectAll()
			.where("userId", "=", userId)
			.where("name", "=", name)
			.executeTakeFirst();
	}

	async findAllApiKeysByUserId(userId: SelectType<ShortnApiKeys["userId"]>) {
		return await this.db
			.selectFrom("shortn.apiKeys")
			.select(["id", "name", "lastFour", "createdAt", "lastUsedAt"])
			.where("userId", "=", userId)
			.execute();
	}

	async countApiKeysByUserId(userId: SelectType<ShortnApiKeys["userId"]>) {
		const result = await this.db
			.selectFrom("shortn.apiKeys")
			.select(this.db.fn.count<number>("id").as("count"))
			.where("userId", "=", userId)
			.executeTakeFirst();

		return result ? result.count : 0;
	}
}
