
import { ApiError } from "../utils/api-error.js";

export function notFoundHandler(req, res, next) {
  next(
    new ApiError(
      404,
      "ROUTE_NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} was not found`
    )
  );
}
