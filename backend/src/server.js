
import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { closeRedis, connectRedis } from "./cache/redis.js";

async function startServer() {
  // PostgreSQL is required for the API to operate.
  await pool.query("SELECT 1");

  // Redis is optional. The API can start while it reconnects.
  void connectRedis();

  const server = app.listen(env.port, "0.0.0.0", () => {
    console.info(
      `Task Manager API listening on port ${env.port}`
    );
  });

  let shuttingDown = false;

  function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    console.info(`Received ${signal}; shutting down...`);

    const forceTimer = setTimeout(() => {
      console.error("Shutdown timed out; forcing exit.");
      server.closeAllConnections();
      process.exit(1);
    }, 10000);

    server.close(async (error) => {
      try {
        if (error) {
          throw error;
        }

        await Promise.all([
          pool.end(),
          closeRedis()
        ]);

        console.info(
          "HTTP server, PostgreSQL pool, and Redis client closed."
        );

        process.exitCode = 0;
      } catch (shutdownError) {
        console.error("Shutdown failed:", shutdownError);
        process.exitCode = 1;
      } finally {
        clearTimeout(forceTimer);
      }
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch(async (error) => {
  console.error("API startup failed:", error);

  try {
    await Promise.all([
      pool.end(),
      closeRedis()
    ]);
  } catch (shutdownError) {
    console.error("Failed to close resources:", shutdownError);
  }

  process.exitCode = 1;
});
