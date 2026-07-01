import { DB, ShortnSessions, ShortnUsers } from "~/types/db";
import { Insertable, Kysely, SelectType, Updateable } from "kysely";

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

	async updateUser(id: SelectType<ShortnUsers["id"]>, values: Updateable<ShortnUsers>) {
		return await this.db.updateTable("shortn.users").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteUser(id: SelectType<ShortnUsers["id"]>) {
		return await this.db.deleteFrom("shortn.users").where("id", "=", id).execute();
	}

	async findUser(id: SelectType<ShortnUsers["id"]>) {
		return await this.db.selectFrom("shortn.users").selectAll().where("id", "=", id).executeTakeFirst();
	}

	async findUserByEmail(email: SelectType<ShortnUsers["email"]>) {
		return await this.db.selectFrom("shortn.users").selectAll().where("email", "=", email).executeTakeFirst();
	}

	// ------------------- SESSION ------------------- //

	async insertSession(values: Insertable<ShortnSessions>) {
		return await this.db.insertInto("shortn.sessions").values(values).executeTakeFirstOrThrow();
	}

	async findSession(id: SelectType<ShortnSessions["id"]>) {
		return await this.db
			.selectFrom("shortn.sessions")
			.selectAll()
			.where("id", "=", id)
			.where("expiresAt", ">", new Date())
			.executeTakeFirst();
	}

	async updateSession(id: SelectType<ShortnSessions["id"]>, values: Updateable<ShortnSessions>) {
		return await this.db.updateTable("shortn.sessions").set(values).where("id", "=", id).executeTakeFirstOrThrow();
	}

	async deleteSession(id: SelectType<ShortnSessions["id"]>) {
		return await this.db.deleteFrom("shortn.sessions").where("id", "=", id).execute();
	}
}
