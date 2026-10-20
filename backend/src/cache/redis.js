
import { createClient } from "redis";

import { env } from "../config/env.js";

export const redisClient = createClient({
  socket: {
    host: env.redisHost,
    port: env.redisPort
  }
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error.message);
});

redisClient.on("ready", () => {
  console.info("Redis connection is ready.");
});

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

export async function connectRedis() {
  if (redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.connect();
  } catch (error) {
    console.warn(
      "Redis is unavailable; caching will be skipped:",
      error.message
    );
  }
}

export async function closeRedis() {
  if (redisClient.isReady) {
    await redisClient.quit();
    return;
  }

  if (redisClient.isOpen) {
    redisClient.disconnect();
  }
}
