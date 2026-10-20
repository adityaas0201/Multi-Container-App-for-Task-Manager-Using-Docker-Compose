
import { useState } from "react";

export default function TaskForm({ onCreate, disabled }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const created = await onCreate({
        title: trimmedTitle,
        description: description.trim(),
        completed: false
      });
      
      if (created) {
        setTitle("");
        setDescription("");
      }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor="task-title">Task title</label>
      <input
        id="task-title"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Learn Docker networking"
        maxLength={120}
        required
        disabled={disabled}
      />

      <label htmlFor="task-description">Description (optional)</label>
      <textarea
        id="task-description"
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="What needs to be done?"
        maxLength={1000}
        rows={3}
        disabled={disabled}
      />

      <button
        className="primary-button"
        type="submit"
        disabled={disabled || !title.trim()}
      >
        Add task
      </button>
    </form>
  );
}
