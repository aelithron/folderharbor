import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getConfig } from "../index.js";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: NodePgDatabase<any> & { $client: Pool; };
export default function db() {
  if (!dbInstance) {
    const pool = new Pool({
      connectionString: getConfig()?.database,
      max: 10,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 20000
    });
    dbInstance = drizzle(pool);
  }
  return dbInstance;
}
export async function migrateDB() {
  try {
    await db().execute(sql`SELECT 1`);
  } catch {
    console.error("Database Error - Couldn't connect! Your configuration is likely incorrect, or your database is down.\nPlease check your database and restart this server.");
    process.exit(1);
  }
  try {
    await migrate(db(), { migrationsFolder: path.join(process.env.INSTALL_PATH || (path.dirname(fileURLToPath(import.meta.url)) + "../../../"), "/drizzle") });
  } catch (e) {
    console.error(`Database Error (with migrations) - ${e}`);
    process.exit(1);
  }
}