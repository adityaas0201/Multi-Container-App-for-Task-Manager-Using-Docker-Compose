
import { pool } from "../db/pool.js";

const taskColumns = `
  id,
  title,
  description,
  completed,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function findAll() {
  const { rows } = await pool.query(`
    SELECT ${taskColumns}
    FROM public.tasks
    ORDER BY id DESC
  `);

  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${taskColumns}
     FROM public.tasks
     WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO public.tasks (
       title,
       description,
       completed
     )
     VALUES ($1, $2, $3)
     RETURNING ${taskColumns}`,
    [
      data.title,
      data.description ?? "",
      data.completed ?? false
    ]
  );

  return rows[0];
}

export async function update(id, changes) {
  const columnMap = {
    title: "title",
    description: "description",
    completed: "completed"
  };

  const values = [];
  const assignments = [];

  for (const [field, value] of Object.entries(changes)) {
    const column = columnMap[field];

    if (!column) {
      continue;
    }

    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  }

  if (assignments.length === 0) {
    return findById(id);
  }

  assignments.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE public.tasks
     SET ${assignments.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${taskColumns}`,
    values
  );

  return rows[0] ?? null;
}

export async function remove(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.tasks
     WHERE id = $1`,
    [id]
  );

  return rowCount > 0;
}
