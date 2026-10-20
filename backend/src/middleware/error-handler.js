
import { ApiError } from "../utils/api-error.js";

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isApiError = error instanceof ApiError;

  const isInvalidJson =
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error;

  const isPayloadTooLarge =
    error.status === 413 ||
    error.type === "entity.too.large";

  const isClientError =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500;

  let statusCode;
  let code;
  let message;

  if (isApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (isInvalidJson) {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Request body contains invalid JSON";
  } else if (isPayloadTooLarge) {
    statusCode = 413;
    code = "PAYLOAD_TOO_LARGE";
    message = "Request body exceeds the allowed size";
  } else if (isClientError) {
    statusCode = error.status;
    code = statusCode === 404 ? "NOT_FOUND" : "REQUEST_ERROR";
    message =
      statusCode === 404
        ? "The requested resource was not found"
        : "The request could not be processed";
  } else {
    statusCode = 500;
    code = "INTERNAL_SERVER_ERROR";
    message = "An unexpected error occurred";
  }

  if (statusCode >= 500) {
    console.error("Request failed:", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      error
    });
  }

  return res.status(statusCode).json({
    error: {
      code,
      message,
      requestId: req.requestId
    }
  });
}
