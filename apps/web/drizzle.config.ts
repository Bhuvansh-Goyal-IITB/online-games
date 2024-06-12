import "dotenv/config";
import { Config, defineConfig } from "drizzle-kit";

let config: Config;

if (process.env.NODE_ENV == "development") {
  config = defineConfig({
    schema: "./db/schema",
    out: "./migrations",
    dialect: "sqlite",
    driver: "turso",
    dbCredentials: {
      url: process.env.TURSO_CONNECTION_URL!,
    },
  });
} else {
  config = defineConfig({
    schema: "./db/schema",
    out: "./migrations",
    dialect: "sqlite",
    driver: "turso",
    dbCredentials: {
      url: process.env.TURSO_CONNECTION_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  });
}

export default config;
