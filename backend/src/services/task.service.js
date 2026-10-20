
import * as taskRepository from "../repositories/task.repository.js";
import {
  getCachedValue,
  invalidateTaskCache,
  setCachedValue,
  taskCacheKey,
  taskListCacheKey
} from "../cache/task-cache.js";
import { ApiError } from "../utils/api-error.js";

export async function listTasks() {
  const cachedTasks = await getCachedValue(taskListCacheKey);

  if (cachedTasks !== null) {
    return cachedTasks;
  }

  const tasks = await taskRepository.findAll();

  await setCachedValue(taskListCacheKey, tasks);

  return tasks;
}

export async function getTask(id) {
  const key = taskCacheKey(id);
  const cachedTask = await getCachedValue(key);

  if (cachedTask !== null) {
    return cachedTask;
  }

  const task = await taskRepository.findById(id);

  if (!task) {
    throw new ApiError(
      404,
      "TASK_NOT_FOUND",
      `Task ${id} was not found`
    );
  }

  await setCachedValue(key, task);

  return task;
}

export async function createTask(data) {
  const task = await taskRepository.create(data);

  await invalidateTaskCache(taskListCacheKey);

  return task;
}

export async function updateTask(id, changes) {
  const task = await taskRepository.update(id, changes);

  if (!task) {
    throw new ApiError(
      404,
      "TASK_NOT_FOUND",
      `Task ${id} was not found`
    );
  }

  await invalidateTaskCache(
    taskListCacheKey,
    taskCacheKey(id)
  );

  return task;
}

export async function deleteTask(id) {
  const deleted = await taskRepository.remove(id);

  if (!deleted) {
    throw new ApiError(
      404,
      "TASK_NOT_FOUND",
      `Task ${id} was not found`
    );
  }

  await invalidateTaskCache(
    taskListCacheKey,
    taskCacheKey(id)
  );
}
