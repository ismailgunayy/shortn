import { DB, ShortnApiKeys, ShortnUsers } from "~/types/db";
import { Insertable, Kysely, Updateable } from "kysely";

export class AuthRepository {
	constructor(private db: Kysely<DB>) {}

	// ------------------- USER ------------------- //

	async insertUser(values: Insertable<DB["shortn.users"]>) {
		return await this.db
			.insertInto("shortn.users")
			.values(values)
			.returning(["id", "fullName", "email"])
			.executeTakeFirstOrThrow();
	}

	async updateUser(id: number, values: Updateable<ShortnUsers>) {
		return await this.db.updateTable("shortn.users").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteUser(id: number) {
		return await this.db.deleteFrom("shortn.users").where("id", "=", id).execute();
	}

	async findUser(id: number) {
		return await this.db.selectFrom("shortn.users").selectAll().where("id", "=", id).executeTakeFirst();
	}

	async findUserByEmail(email: ShortnUsers["email"]) {
		return await this.db.selectFrom("shortn.users").selectAll().where("email", "=", email).executeTakeFirst();
	}

	// ------------------- API KEY ------------------- //

	async insertApiKey(values: Insertable<ShortnApiKeys>) {
		return await this.db.insertInto("shortn.apiKeys").values(values).returningAll().executeTakeFirstOrThrow();
	}

	async updateApiKey(id: number, values: Updateable<ShortnApiKeys>) {
		return await this.db.updateTable("shortn.apiKeys").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteApiKey(id: number, userId: number) {
		return await this.db.deleteFrom("shortn.apiKeys").where("userId", "=", userId).where("id", "=", id).execute();
	}

	async findApiKey(id: number, userId: number) {
		return await this.db
			.selectFrom("shortn.apiKeys")
			.selectAll()
			.where("userId", "=", userId)
			.where("id", "=", id)
			.executeTakeFirst();
	}

	async findApiKeyByHash(keyHash: string) {
		return await this.db.selectFrom("shortn.apiKeys").selectAll().where("keyHash", "=", keyHash).executeTakeFirst();
	}

	async findApiKeyByName(userId: number, name: string) {
		return await this.db
			.selectFrom("shortn.apiKeys")
			.selectAll()
			.where("userId", "=", userId)
			.where("name", "=", name)
			.executeTakeFirst();
	}

	async findAllApiKeysByUserId(userId: number) {
		return await this.db
			.selectFrom("shortn.apiKeys")
			.select(["id", "name", "lastFour"])
			.where("userId", "=", userId)
			.execute();
	}
}
