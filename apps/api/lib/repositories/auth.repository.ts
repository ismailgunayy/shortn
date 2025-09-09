import { DB, ShortnUsers } from "~/types/db";
import { Insertable, Kysely, Updateable } from "kysely";

export class AuthRepository {
	constructor(private db: Kysely<DB>) {}

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
		return await this.db.deleteFrom("shortn.users").where("id", "=", id).executeTakeFirstOrThrow();
	}

	async findUserById(id: number) {
		return await this.db.selectFrom("shortn.users").selectAll().where("id", "=", id).executeTakeFirst();
	}

	async findUserByEmail(email: DB["shortn.users"]["email"]) {
		return await this.db.selectFrom("shortn.users").selectAll().where("email", "=", email).executeTakeFirst();
	}

	async insertApiKey(values: Insertable<DB["shortn.apiKeys"]>) {
		return await this.db.insertInto("shortn.apiKeys").values(values).returningAll().executeTakeFirstOrThrow();
	}

	async updateApiKey(id: number, values: Updateable<DB["shortn.apiKeys"]>) {
		return await this.db.updateTable("shortn.apiKeys").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteApiKey(id: number) {
		return await this.db.deleteFrom("shortn.apiKeys").where("id", "=", id).executeTakeFirstOrThrow();
	}

	async findApiKeyByHash(keyHash: string) {
		return await this.db.selectFrom("shortn.apiKeys").selectAll().where("keyHash", "=", keyHash).executeTakeFirst();
	}

	async findApiKeysByUserId(userId: number) {
		return await this.db.selectFrom("shortn.apiKeys").selectAll().where("userId", "=", userId).execute();
	}
}
