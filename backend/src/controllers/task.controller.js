
import * as taskService from "../services/task.service.js";

export async function listTasks(req, res) {
  const tasks = await taskService.listTasks();

  return res.status(200).json({
    data: tasks
  });
}

export async function getTask(req, res) {
  const task = await taskService.getTask(req.taskId);

  return res.status(200).json({
    data: task
  });
}

export async function createTask(req, res) {
  const task = await taskService.createTask(req.body);

  return res.status(201).json({
    data: task
  });
}

export async function updateTask(req, res) {
  const task = await taskService.updateTask(
    req.taskId,
    req.body
  );

  return res.status(200).json({
    data: task
  });
}

export async function deleteTask(req, res) {
  await taskService.deleteTask(req.taskId);

  return res.status(204).end();
}
