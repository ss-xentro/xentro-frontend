import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schemas';

// Type for our Drizzle instance with schema
type DbType = ReturnType<typeof drizzle<typeof schema>>;

// Lazy connection initialization to avoid build-time errors
let _db: DbType | null = null;

function getDb(): DbType {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const connection = neon(databaseUrl);
    _db = drizzle({ client: connection, schema });
  }
  return _db;
}

export const db = new Proxy({} as DbType, {
  get(target, prop) {
    return getDb()[prop as keyof DbType];
  },
});
