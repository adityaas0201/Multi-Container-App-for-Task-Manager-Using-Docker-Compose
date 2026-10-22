import { createClient } from "redis";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { formatUrl } from "@aws-sdk/util-format-url";

import { env } from "../config/env.js";

const region = process.env.AWS_REGION || "ap-south-1";
const awsCredentialsProvider = defaultProvider();

const signer = new SignatureV4({
  credentials: awsCredentialsProvider,
  region,
  service: "elasticache",
  sha256: Sha256,
});

const cacheName = process.env.REDIS_REPLICATION_GROUP_ID;
async function createIamCredentials() {
  if (!env.redisIamAuth) {
    throw new Error("Redis IAM authentication is not enabled");
  }

  if (!env.redisUsername || !cacheName) {
    throw new Error(
      "REDIS_USERNAME and REDIS_REPLICATION_GROUP_ID are required for IAM authentication",
    );
  }

  const request = new HttpRequest({
    protocol: "https:",
    hostname: cacheName,                 // the group ID, not the endpoint
    method: "GET",
    path: "/",
    query: {
      Action: "connect",
      User: env.redisUsername,
    },
    headers: {
      host: cacheName,
    },
  });

  const signedRequest = await signer.presign(request, {
    expiresIn: 900,
  });

  const token = formatUrl(signedRequest).replace(/^https:\/\//, "");

  return {
    username: env.redisUsername,
    password: token,
  };
}

const redisOptions = {
  socket: {
    host: env.redisHost,
    port: env.redisPort,
    ...(env.redisTls ? { tls: true } : {}),
    reconnectStrategy(retries) {
      return Math.min(retries * 500, 5000);
    },
  },

  ...(env.redisIamAuth
    ? {
        credentialsProvider: {
          type: "async-credentials-provider",
          credentials: createIamCredentials,
        },
      }
    : {}),
};

export const redisClient = createClient(redisOptions);

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
    console.error(
      "Redis connection failed; caching may be unavailable:",
      error.message,
    );
  }
}

export async function closeRedis() {
  if (redisClient.isReady) {
    await redisClient.quit();
  } else if (redisClient.isOpen) {
    redisClient.destroy();
  }
}