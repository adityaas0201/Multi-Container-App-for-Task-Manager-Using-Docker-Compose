
import test from "node:test";
import assert from "node:assert/strict";

import {
  validateTaskBody,
  validateTaskId
} from "../../src/middleware/task-validation.js";

function runMiddleware(middleware, req) {
  let nextError = null;
  let nextCalled = false;

  middleware(req, {}, (error) => {
    nextCalled = true;
    nextError = error ?? null;
  });

  return {
    nextCalled,
    error: nextError
  };
}

test("accepts a valid task creation body", () => {
  const req = {
    method: "POST",
    body: {
      title: "  Learn automated testing  ",
      description: "Write unit tests",
      completed: false
    }
  };

  const result = runMiddleware(validateTaskBody, req);

  assert.equal(result.nextCalled, true);
  assert.equal(result.error, null);
  assert.equal(req.body.title, "Learn automated testing");
});

test("rejects a blank task title", () => {
  const req = {
    method: "POST",
    body: {
      title: "   "
    }
  };

  const result = runMiddleware(validateTaskBody, req);

  assert.equal(result.nextCalled, true);
  assert.equal(result.error.statusCode, 400);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("rejects unsupported task fields", () => {
  const req = {
    method: "POST",
    body: {
      title: "Test task",
      isAdmin: true
    }
  };

  const result = runMiddleware(validateTaskBody, req);

  assert.equal(result.error.statusCode, 400);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("rejects a non-boolean completed value", () => {
  const req = {
    method: "PATCH",
    body: {
      completed: "true"
    }
  };

  const result = runMiddleware(validateTaskBody, req);

  assert.equal(result.error.statusCode, 400);
  assert.equal(result.error.code, "VALIDATION_ERROR");
});

test("accepts a positive integer task ID", () => {
  const req = {
    params: {
      id: "42"
    }
  };

  const result = runMiddleware(validateTaskId, req);

  assert.equal(result.error, null);
  assert.equal(req.taskId, 42);
});

test("rejects a non-numeric task ID", () => {
  const req = {
    params: {
      id: "abc"
    }
  };

  const result = runMiddleware(validateTaskId, req);

  assert.equal(result.error.statusCode, 400);
  assert.equal(result.error.code, "INVALID_TASK_ID");
});

test("rejects zero as a task ID", () => {
  const req = {
    params: {
      id: "0"
    }
  };

  const result = runMiddleware(validateTaskId, req);

  assert.equal(result.error.statusCode, 400);
  assert.equal(result.error.code, "INVALID_TASK_ID");
});
