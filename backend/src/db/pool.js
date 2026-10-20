
import pg from "pg";

import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  application_name: "task-manager-api"
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error);
});
