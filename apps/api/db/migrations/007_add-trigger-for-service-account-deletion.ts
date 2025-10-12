import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	const domain = new URL(process.env.CLIENT_URL as string).hostname;
	const serviceAccountEmail = `service-account@${domain}`;

	const functionSQL = `
		CREATE OR REPLACE FUNCTION prevent_service_account_deletion()
		RETURNS trigger AS $$
		BEGIN
			IF OLD.email = '${serviceAccountEmail}' THEN
				RAISE EXCEPTION 'Service account cannot be deleted';
			END IF;
			RETURN OLD;
		END;
		$$ LANGUAGE plpgsql;
	`;

	await sql.raw(functionSQL).execute(db);

	await sql`
		CREATE TRIGGER prevent_service_account_deletion
		BEFORE DELETE ON shortn.users
		FOR EACH ROW
		EXECUTE FUNCTION prevent_service_account_deletion();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`
		DROP TRIGGER IF EXISTS prevent_service_account_deletion ON shortn.users;
	`.execute(db);

	await sql`
		DROP FUNCTION IF EXISTS prevent_service_account_deletion();
	`.execute(db);
}
