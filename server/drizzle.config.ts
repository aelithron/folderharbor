import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/utils/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // @ts-expect-error because this isn't in the src folder, it acts like node types don't exist
    url: process.env.DATABASE_URL!
  },
});
