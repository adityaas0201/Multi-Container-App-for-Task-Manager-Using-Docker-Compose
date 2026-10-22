import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand
} from "@aws-sdk/client-secrets-manager";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import pg from "pg";

const { Client } = pg;

const region = process.env.AWS_REGION ?? "ap-south-1";
const masterSecretArn = process.env.MASTER_SECRET_ARN;
const host = process.env.PGHOST;
const port = Number(process.env.PGPORT ?? "5432");
const database = process.env.PGDATABASE;

const appSecretName = "taskmanager/api-db";
const migratorSecretName = "taskmanager/migrator-db";

const secrets = new SecretsManagerClient({ region });

function required(value, name) {
  if (!value) {
    throw new Error(`Missing configuration: ${name}`);
  }
  return value;
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function quoteLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function makePassword() {
  return randomBytes(32).toString("base64url");
}

async function getSecret(secretId) {
  const result = await secrets.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );

  if (!result.SecretString) {
    throw new Error("Secret has no SecretString");
  }

  return JSON.parse(result.SecretString);
}

async function getOrCreateCredentials(secretName, username) {
  try {
    const existing = await getSecret(secretName);

    if (
      existing.username !== username ||
      typeof existing.password !== "string" ||
      existing.password.length < 32
    ) {
      throw new Error(
        `Existing secret ${secretName} has an unexpected structure`
      );
    }

    return existing;
  } catch (error) {
    if (error.name !== "ResourceNotFoundException") {
      throw error;
    }
  }

  const value = {
    username,
    password: makePassword(),
    host,
    port,
    dbname: database
  };

  try {
    await secrets.send(
      new CreateSecretCommand({
        Name: secretName,
        Description: "Task Manager database credentials",
        SecretString: JSON.stringify(value),
        Tags: [
          { Key: "Project", Value: "chapter28-task-manager" },
          { Key: "Purpose", Value: "database-credentials" }
        ]
      })
    );

    return value;
  } catch (error) {
    // Another invocation might have created the secret concurrently.
    if (error.name === "ResourceExistsException") {
      const existing = await getSecret(secretName);

      if (
        existing.username === username &&
        typeof existing.password === "string" &&
        existing.password.length >= 32
      ) {
        return existing;
      }
    }

    throw error;
  }
}

async function ensureRole(client, username, password) {
  const result = await client.query(
    "SELECT 1 FROM pg_roles WHERE rolname = $1",
    [username]
  );

  const role = quoteIdentifier(username);
  const literal = quoteLiteral(password);

  if (result.rowCount > 0) {
    await client.query(
      `ALTER ROLE ${role} WITH LOGIN PASSWORD ${literal}`
    );
  } else {
    await client.query(
      `CREATE ROLE ${role} WITH LOGIN PASSWORD ${literal}`
    );
  }
}

async function main() {
  required(masterSecretArn, "MASTER_SECRET_ARN");
  required(host, "PGHOST");
  required(database, "PGDATABASE");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PGPORT is invalid");
  }

  const master = await getSecret(masterSecretArn);

  required(master.username, "master secret username");
  required(master.password, "master secret password");

  const appCredentials = await getOrCreateCredentials(
    appSecretName,
    "taskmanager_app"
  );

  const migratorCredentials = await getOrCreateCredentials(
    migratorSecretName,
    "taskmanager_migrator"
  );

  const ca = await readFile("/app/global-bundle.pem", "utf8");

  const client = new Client({
    host,
    port,
    database,
    user: master.username,
    password: master.password,
    ssl: {
      ca,
      rejectUnauthorized: true
    },
    connectionTimeoutMillis: 10000,
    application_name: "task-manager-db-bootstrap"
  });

  await client.connect();

  try {
    await client.query("BEGIN");

    try {
      await ensureRole(
        client,
        "taskmanager_app",
        appCredentials.password
      );

      await ensureRole(
        client,
        "taskmanager_migrator",
        migratorCredentials.password
      );

      const db = quoteIdentifier(database);

      await client.query(
        `GRANT CONNECT ON DATABASE ${db} TO taskmanager_app`
      );

      await client.query(
        "GRANT USAGE ON SCHEMA public TO taskmanager_app"
      );

      await client.query(
        "GRANT USAGE, CREATE ON SCHEMA public TO taskmanager_migrator"
      );

      await client.query(
        "GRANT SELECT, INSERT, UPDATE, DELETE " +
        "ON ALL TABLES IN SCHEMA public TO taskmanager_app"
      );

      await client.query(
        "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public " +
        "TO taskmanager_app"
      );

      // PostgreSQL requires membership to alter another role's
      // default privileges. Grant it temporarily and always revoke it.
      const masterRole = quoteIdentifier(master.username);

      await client.query(
        `GRANT taskmanager_migrator TO ${masterRole}`
      );

      try {
        await client.query(
          "ALTER DEFAULT PRIVILEGES FOR ROLE taskmanager_migrator " +
          "IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE " +
          "ON TABLES TO taskmanager_app"
        );

        await client.query(
          "ALTER DEFAULT PRIVILEGES FOR ROLE taskmanager_migrator " +
          "IN SCHEMA public GRANT USAGE, SELECT " +
          "ON SEQUENCES TO taskmanager_app"
        );
      } finally {
        await client.query(
          `REVOKE taskmanager_migrator FROM ${masterRole}`
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    await client.end();
  }

  console.log("Database bootstrap completed successfully.");
}

main().catch((error) => {
  // Never print secrets or SQL parameters.
  console.error("Database bootstrap failed:", error.message);
  process.exitCode = 1;
});