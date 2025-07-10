import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database URL:', process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Use pg.Pool for local PostgreSQL
export const PostDbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: false, // optionally enable if needed
});

// Drizzle instance using pg
export const db = drizzle(PostDbPool, { schema });

// Connection test
export const connectDB = async () => {
  try {
    const client = await PostDbPool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('PostgreSQL Database connected @', result.rows[0].now);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

export default db;
