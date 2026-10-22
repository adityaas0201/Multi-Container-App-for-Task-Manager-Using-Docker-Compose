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

function readBoolean(name, fallback) {
  const value = process.env[name] ?? String(fallback);

  if (value !== "true" && value !== "false") {
    throw new Error(`${name} must be "true" or "false"`);
  }

  return value === "true";
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
        { cause: error },
      );
    }
  }

  const password = process.env.DB_PASSWORD;

  if (typeof password !== "string" || password.length === 0) {
    throw new Error("Set DB_PASSWORD or provide DB_PASSWORD_FILE");
  }

  return password;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error(
    'NODE_ENV must be "development", "test", or "production"',
  );
}

const redisIamAuth = readBoolean("REDIS_IAM_AUTH", false);
const redisTls = readBoolean("REDIS_TLS", false);

const redisHost = readNonEmptyString(
  "REDIS_HOST",
  nodeEnv === "production" ? "" : "127.0.0.1",
);

const dbHost = readNonEmptyString(
  "DB_HOST",
  nodeEnv === "production" ? "" : "127.0.0.1",
);

const redisUsername = process.env.REDIS_USERNAME?.trim() ?? "";

if (redisIamAuth && !redisUsername) {
  throw new Error(
    "REDIS_USERNAME is required when REDIS_IAM_AUTH=true",
  );
}

if (nodeEnv === "production" && redisIamAuth && !redisTls) {
  throw new Error(
    "REDIS_TLS must be true when IAM authentication is enabled",
  );
}

export const env = Object.freeze({
  nodeEnv,
  port: readPort("PORT", 3000),

  dbHost,
  dbPort: readPort("DB_PORT", 5432),
  dbName: readNonEmptyString("DB_NAME", "taskmanager"),
  dbUser: readNonEmptyString("DB_USER", "taskapp"),
  dbPassword: readPassword(),

  redisHost,
  redisPort: readPort("REDIS_PORT", 6379),
  redisIamAuth,
  redisTls,
  redisUsername,
});