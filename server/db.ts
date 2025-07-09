import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// PostgreSQL connection
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export const connectDB = async () => {
  try {
    // Test the connection
    await sql`SELECT 1`;
    console.log("Connected to PostgreSQL successfully");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

export default db;