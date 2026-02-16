import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { rolesTable } from "./schema.js";

dotenv.config({ quiet: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 20000
});
const db = drizzle(pool);
export default db;
export async function seedDB() {
  await db.insert(rolesTable).values([
    { name: "Default" },
    { name: "Limited Admin", permissions: ["users:read", "users:edit", "users:lock", "roles:read"] },
    { name: "Owner", permissions: ["users:create", "users:delete", "users:read.full", "users:edit.full", "users:lock", "users:grant"] }
  ]);
}