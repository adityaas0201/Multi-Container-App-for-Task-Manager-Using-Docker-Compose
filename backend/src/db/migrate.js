
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { pool } from "./pool.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = resolve(currentDirectory, "../../migrations");
const migrationLockId = 741852963;

async function runMigrations() {
  let client;
  let lockAcquired = false;

  try {
    client = await pool.connect();

    await client.query("SELECT pg_advisory_lock($1)", [
      migrationLockId
    ]);
    lockAcquired = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows } = await client.query(
      "SELECT name FROM public.schema_migrations"
    );

    const appliedMigrations = new Set(
      rows.map(({ name }) => name)
    );

    const files = (await readdir(migrationsDirectory))
      .filter((file) => /^\d+_.+\.sql$/.test(file))
      .sort();

    for (const file of files) {
      if (appliedMigrations.has(file)) {
        console.info(`Skipping applied migration: ${file}`);
        continue;
      }

      const sql = await readFile(
        join(migrationsDirectory, file),
        "utf8"
      );

      console.info(`Applying migration: ${file}`);

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `INSERT INTO public.schema_migrations (name)
           VALUES ($1)`,
          [file]
        );

        await client.query("COMMIT");

        console.info(`Applied migration: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.info("Database migrations completed.");
  } finally {
    try {
      if (client && lockAcquired) {
        await client.query("SELECT pg_advisory_unlock($1)", [
          migrationLockId
        ]);
      }
    } finally {
      client?.release();
      await pool.end();
    }
  }
}

runMigrations().catch((error) => {
  console.error("Database migration failed:", error);
  process.exitCode = 1;
});
