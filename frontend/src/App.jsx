
import { useCallback, useEffect, useState } from "react";

import TaskForm from "./components/TaskForm.jsx";
import { taskApi } from "./services/task-api.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await taskApi.list();
      setTasks(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleCreate(task) {
    setSaving(true);
    setError("");
  
    try {
      await taskApi.create(task);
      await loadTasks();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    setError("");

    try {
      const updatedTask = await taskApi.update(task.id, {
        completed: !task.completed
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id
            ? updatedTask
            : currentTask
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDelete(id) {
    setError("");

    try {
      await taskApi.remove(id);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Task Manager</h1>
          <p className="subtitle">
            Plan your work. Track your progress.
          </p>
        </div>

        <div className="task-count" aria-label="Task statistics">
          <strong>{completedCount}/{tasks.length}</strong>
          <span>completed</span>
        </div>
      </header>

      <section className="panel">
        <h2>Create a task</h2>
        <TaskForm onCreate={handleCreate} disabled={saving} />
      </section>

      <section className="task-section">
        <div className="section-heading">
          <h2>Your tasks</h2>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void loadTasks()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => void loadTasks()}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <p className="status-message" role="status">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first task using the form above.</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li className="task-item" key={task.id}>
                <label className="task-main">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => void handleToggle(task)}
                    aria-label={`Mark "${task.title}" ${
                      task.completed ? "incomplete" : "complete"
                    }`}
                  />

                  <span
                    className={
                      task.completed
                        ? "task-title completed"
                        : "task-title"
                    }
                  >
                    {task.title}
                  </span>
                </label>

                {task.description && (
                  <p className="task-description">
                    {task.description}
                  </p>
                )}

                <div className="task-footer">
                  <span
                    className={
                      task.completed
                        ? "status-pill done"
                        : "status-pill pending"
                    }
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </span>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => void handleDelete(task.id)}
                    aria-label={`Delete ${task.title}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="page-footer">
        React frontend · Express API · PostgreSQL · Redis
      </footer>
    </main>
  );
}
