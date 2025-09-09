import { Kysely, sql } from "kysely";

export const createUpdatedAtTrigger = async (tableName: string, db: Kysely<unknown>) => {
	await sql`
	CREATE OR REPLACE FUNCTION update_updated_at_column()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = NOW();
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;`.execute(db);

	const triggerSQL = `
	CREATE TRIGGER update_${tableName}_updated_at
	BEFORE UPDATE ON shortn.${tableName}
	FOR EACH ROW
	EXECUTE PROCEDURE update_updated_at_column();`;

	await sql.raw(triggerSQL).execute(db);
};
