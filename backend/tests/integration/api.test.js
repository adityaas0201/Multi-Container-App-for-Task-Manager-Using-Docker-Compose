
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

// Configure values before importing the application modules.
process.env.NODE_ENV ??= "test";
process.env.DB_SSL ??= "false"; 
process.env.DB_HOST ??= "127.0.0.1";
process.env.DB_PORT ??= "5432";
process.env.DB_NAME ??= "taskmanager";
process.env.DB_USER ??= "taskapp";
process.env.DB_PASSWORD ??= "test-only-password";
process.env.REDIS_HOST ??= "127.0.0.1";
process.env.REDIS_PORT ??= "6380";


const { default: app } = await import("../../src/app.js");

test("GET /health returns a successful response", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(typeof response.body.timestamp, "string");
});

test("responses include a request ID", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(typeof response.headers["x-request-id"], "string");
  assert.equal(response.headers["x-request-id"].length, 36);
  assert.equal(
    response.body.requestId,
    response.headers["x-request-id"]
  );
});

test("malformed JSON returns INVALID_JSON", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .set("Content-Type", "application/json")
    .send('{"title":');

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "INVALID_JSON");
  assert.equal(typeof response.body.error.requestId, "string");
});

test("blank task titles are rejected", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "   "
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("invalid task IDs are rejected before database access", async () => {
  const response = await request(app).get("/api/tasks/not-a-number");

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "INVALID_TASK_ID");
});

test("unknown routes return a structured 404 response", async () => {
  const response = await request(app).get("/route-that-does-not-exist");

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "ROUTE_NOT_FOUND");
  assert.equal(typeof response.body.error.requestId, "string");
});

test("unsupported task fields are rejected", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "Test task",
      admin: true
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});
