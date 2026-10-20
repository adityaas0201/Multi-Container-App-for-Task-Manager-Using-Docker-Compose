
import test from "node:test";
import assert from "node:assert/strict";

test(
  "PostgreSQL task repository supports create, read, update and delete",
  {
    skip: process.env.RUN_DB_INTEGRATION !== "true"
  },
  async () => {
    // Import only after opting into the database integration test.
    const { pool } = await import("../../src/db/pool.js");
    const repository = await import(
      "../../src/repositories/task.repository.js"
    );

    let createdTask;

    try {
      createdTask = await repository.create({
        title: `Integration test ${Date.now()}`,
        description: "Temporary task for PostgreSQL integration testing",
        completed: false
      });

      assert.ok(Number.isInteger(createdTask.id));
      assert.equal(createdTask.completed, false);

      const foundTask = await repository.findById(createdTask.id);

      assert.ok(foundTask);
      assert.equal(foundTask.title, createdTask.title);

      const updatedTask = await repository.update(createdTask.id, {
        completed: true
      });

      assert.ok(updatedTask);
      assert.equal(updatedTask.completed, true);

      const deleted = await repository.remove(createdTask.id);

      assert.equal(deleted, true);

      const missingTask = await repository.findById(createdTask.id);

      assert.equal(missingTask, null);

      createdTask = null;
    } finally {
      if (createdTask) {
        await repository.remove(createdTask.id);
      }

      await pool.end();
    }
  }
);
