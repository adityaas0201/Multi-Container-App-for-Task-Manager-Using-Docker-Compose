
import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask
} from "../controllers/task.controller.js";

import {
  validateTaskBody,
  validateTaskId
} from "../middleware/task-validation.js";

const router = Router();

router.get("/", listTasks);

router.post("/", validateTaskBody, createTask);

router.get("/:id", validateTaskId, getTask);

router.patch(
  "/:id",
  validateTaskId,
  validateTaskBody,
  updateTask
);

router.delete("/:id", validateTaskId, deleteTask);

export default router;
