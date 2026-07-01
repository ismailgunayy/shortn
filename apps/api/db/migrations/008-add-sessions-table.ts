import { sql, type Kysely } from "kysely";
import { createUpdatedAtTrigger } from "../common";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shortn.sessions")
		.ifNotExists()
		.addColumn("id", "uuid", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) => col.notNull().references("shortn.users.id").onDelete("cascade"))
		.addColumn("refresh_token_hash", "text", (col) => col.notNull())
		.addColumn("expires_at", "timestamptz", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await createUpdatedAtTrigger("sessions", db);
	await db.schema.createIndex("idx_sessions_user_id").on("shortn.sessions").column("user_id").ifNotExists().execute();
	await db.schema
		.createIndex("idx_sessions_expires_at")
		.on("shortn.sessions")
		.column("expires_at")
		.ifNotExists()
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropIndex("idx_sessions_user_id").on("shortn.sessions").ifExists().execute();
	await db.schema.dropIndex("idx_sessions_expires_at").on("shortn.sessions").ifExists().execute();
	await db.schema.dropTable("shortn.sessions").ifExists().execute();
}
