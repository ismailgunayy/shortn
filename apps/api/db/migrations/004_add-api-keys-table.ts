import { sql, type Kysely } from "kysely";
import { createUpdatedAtTrigger } from "../common";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shortn.api_keys")
		.ifNotExists()
		.addColumn("id", "integer", (col) => col.primaryKey().generatedAlwaysAsIdentity())
		.addColumn("user_id", "integer", (col) => col.notNull().references("shortn.users.id").onDelete("cascade"))
		.addColumn("key_hash", "text", (col) => col.notNull().unique())
		.addColumn("last_four", "text", (col) => col.notNull())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
		.addColumn("last_used_at", "timestamp", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await createUpdatedAtTrigger("api_keys", db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("shortn.api_keys").ifExists().execute();
}
