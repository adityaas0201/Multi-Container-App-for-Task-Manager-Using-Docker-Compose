
import { readFileSync } from "node:fs";

function readNonEmptyString(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }

  return value.trim();
}

function readPort(name, fallback) {
  const rawValue = process.env[name] ?? String(fallback);

  if (!/^\d+$/.test(rawValue)) {
    throw new Error(`${name} must be a valid integer port`);
  }

  const port = Number(rawValue);

  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be between 1 and 65535`);
  }

  return port;
}

function readPassword() {
  const passwordFile = process.env.DB_PASSWORD_FILE;

  if (passwordFile) {
    try {
      const password = readFileSync(passwordFile, "utf8").trim();

      if (!password) {
        throw new Error("DB_PASSWORD_FILE is empty");
      }

      return password;
    } catch (error) {
      throw new Error(
        `Unable to read DB_PASSWORD_FILE: ${error.message}`,
        { cause: error }
      );
    }
  }

  const password = process.env.DB_PASSWORD;

  if (typeof password !== "string" || password.length === 0) {
    throw new Error(
      "Set DB_PASSWORD or provide DB_PASSWORD_FILE"
    );
  }

  return password;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error(
    'NODE_ENV must be "development", "test", or "production"'
  );
}

export const env = Object.freeze({
  nodeEnv,

  port: readPort("PORT", 3000),

  dbHost: readNonEmptyString("DB_HOST", "127.0.0.1"),
  dbPort: readPort("DB_PORT", 5432),
  dbName: readNonEmptyString("DB_NAME", "taskmanager"),
  dbUser: readNonEmptyString("DB_USER", "taskapp"),
  dbPassword: readPassword(),

  redisHost: readNonEmptyString("REDIS_HOST", "127.0.0.1"),
  redisPort: readPort("REDIS_PORT", 6380)
});
