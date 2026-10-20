
import { ApiError } from "../utils/api-error.js";

const allowedFields = new Set([
  "title",
  "description",
  "completed"
]);

function reject(message) {
  throw new ApiError(400, "VALIDATION_ERROR", message);
}

export function validateTaskId(req, res, next) {
  const rawId = req.params.id;

  if (!/^[1-9]\d*$/.test(rawId)) {
    return next(
      new ApiError(
        400,
        "INVALID_TASK_ID",
        "Task ID must be a positive integer"
      )
    );
  }

  const id = Number(rawId);

  if (!Number.isSafeInteger(id)) {
    return next(
      new ApiError(
        400,
        "INVALID_TASK_ID",
        "Task ID is outside the supported range"
      )
    );
  }

  req.taskId = id;
  return next();
}

export function validateTaskBody(req, res, next) {
  try {
    const body = req.body;

    if (
      body === null ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      reject("Request body must be a JSON object");
    }

    const fields = Object.keys(body);

    if (fields.some((field) => !allowedFields.has(field))) {
      reject("Request body contains unsupported fields");
    }

    if (req.method === "POST" && !("title" in body)) {
      reject("Title is required");
    }

    if (req.method === "PATCH" && fields.length === 0) {
      reject("Provide at least one field to update");
    }

    if ("title" in body) {
      if (typeof body.title !== "string") {
        reject("Title must be a string");
      }

      const title = body.title.trim();

      if (title.length === 0 || title.length > 120) {
        reject("Title must contain between 1 and 120 characters");
      }

      body.title = title;
    }

    if ("description" in body) {
      if (typeof body.description !== "string") {
        reject("Description must be a string");
      }

      if (body.description.length > 1000) {
        reject("Description must not exceed 1000 characters");
      }
    }

    if (
      "completed" in body &&
      typeof body.completed !== "boolean"
    ) {
      reject("Completed must be a boolean");
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
