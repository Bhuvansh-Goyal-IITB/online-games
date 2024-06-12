import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { createClient as serverlessCreateClient } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
});

const serverlessClient = serverlessCreateClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(
  process.env.NODE_ENV == "development" ? client : serverlessClient
);
