
import { redisClient } from "./redis.js";

const CACHE_TTL_SECONDS = 30;

export const taskListCacheKey = "tasks:list";

export function taskCacheKey(id) {
  return `tasks:${id}`;
}

export async function getCachedValue(key) {
  if (!redisClient.isReady) {
    return null;
  }

  try {
    const cachedValue = await redisClient.get(key);

    if (cachedValue === null) {
      return null;
    }

    try {
      return JSON.parse(cachedValue);
    } catch (error) {
      console.warn(
        `Invalid JSON in Redis key "${key}"; treating it as a cache miss.`
      );

      try {
        await redisClient.del(key);
      } catch (deleteError) {
        console.warn(
          "Could not remove corrupted cache entry:",
          deleteError.message
        );
      }

      return null;
    }
  } catch (error) {
    console.warn(
      `Redis read failed for "${key}":`,
      error.message
    );

    return null;
  }
}

export async function setCachedValue(key, value) {
  if (!redisClient.isReady) {
    return false;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: CACHE_TTL_SECONDS
    });

    return true;
  } catch (error) {
    console.warn(
      `Redis write failed for "${key}":`,
      error.message
    );

    return false;
  }
}

export async function invalidateTaskCache(...keys) {
  if (keys.length === 0 || !redisClient.isReady) {
    return false;
  }

  try {
    await redisClient.del(keys);
    return true;
  } catch (error) {
    console.warn(
      "Redis cache invalidation failed:",
      error.message
    );

    return false;
  }
}
