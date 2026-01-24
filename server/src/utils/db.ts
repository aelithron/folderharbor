import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 20000
});
const db = drizzle(pool);
export default db;