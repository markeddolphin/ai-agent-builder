import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import dotenv from 'dotenv';

dotenv.config();


// create connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// create postgres client
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export { client as postgresClient };

export * from './schema.ts'; 