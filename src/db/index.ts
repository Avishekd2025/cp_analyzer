import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "postgresql://postgres:postgres@localhost:5432/cp_analyzer";

if (
  !process.env.DATABASE_URL &&
  !process.env.POSTGRES_URL &&
  !process.env.STORAGE_URL &&
  process.env.NODE_ENV === "production"
) {
  console.warn(
    "[WARNING] No PostgreSQL connection string found in environment variables (DATABASE_URL, POSTGRES_URL, STORAGE_URL)."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __postgresClient: ReturnType<typeof postgres> | undefined;
}

// Reuse connection across serverless invocations and avoid connection exhaustion
const client =
  globalThis.__postgresClient ||
  postgres(connectionString, {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 10 : 1,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__postgresClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
