import pg from "pg";
import { readFile } from "node:fs/promises";

import { env } from "../config/env.js";

const { Pool } = pg;

// SSL stays ON unless DB_SSL is explicitly set to "false" (used by tests).
const sslEnabled = process.env.DB_SSL !== "false";
const caPath = process.env.DB_SSL_CA_PATH ?? "/app/global-bundle.pem";

const ssl = sslEnabled
  ? {
      ca: await readFile(caPath, "utf8"),
      rejectUnauthorized: true
    }
  : false;

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,

  ssl,

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  application_name: "task-manager-api"
});

pool.on("error", (error) => {
  console.error(
    "Unexpected idle PostgreSQL client error:",
    error.message
  );
});