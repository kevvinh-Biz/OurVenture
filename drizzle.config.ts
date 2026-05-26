import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Allow `drizzle-kit` to be imported in CI without a DB; commands themselves
  // will fail loudly without DATABASE_URL.
  // eslint-disable-next-line no-console
  console.warn('[drizzle.config] DATABASE_URL is not set.');
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials: {
    url: databaseUrl ?? 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  verbose: true,
  strict: true,
});
