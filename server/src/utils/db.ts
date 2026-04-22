import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getConfig } from "../index.js";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export default function db() {
  const pool = new Pool({
    connectionString: getConfig()?.database,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 20000
  });
  const db = drizzle(pool);
  return db;
}
export async function migrateDB() {
  try {
    //await migrate(db(), { migrationsFolder: "./drizzle" });
  } catch (e) {
    console.error(`Database Error - ${e}`);
    process.exit(1);
  }
}