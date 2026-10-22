import pg from "pg";
import { readFile } from "node:fs/promises";

import { env } from "../config/env.js";

const { Pool } = pg;

const ca = await readFile("/app/global-bundle.pem", "utf8");

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,

  ssl: {
    ca,
    rejectUnauthorized: true
  },

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