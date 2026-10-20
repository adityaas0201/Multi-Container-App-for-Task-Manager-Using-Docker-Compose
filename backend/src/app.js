
import express from "express";

import taskRoutes from "./routes/task.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { pool } from "./db/pool.js";

const app = express();

app.disable("x-powered-by");

app.use(requestIdMiddleware);

app.use((req, res, next) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    const durationMs = (
      performance.now() - startedAt
    ).toFixed(1);

    console.info({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Number(durationMs)
    });
  });

  next();
});

app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  return res.status(200).json({
    service: "task-manager-api",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      readiness: "/ready",
      tasks: "/api/tasks"
    },
    requestId: req.requestId
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

app.get("/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      status: "ready",
      dependencies: {
        postgres: "ok"
      },
      requestId: req.requestId
    });
  } catch {
    return res.status(503).json({
      status: "not_ready",
      dependencies: {
        postgres: "unavailable"
      },
      requestId: req.requestId
    });
  }
});

app.use("/api/tasks", taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
