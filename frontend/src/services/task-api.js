async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
  
      try {
        const body = await response.json();
        message = body?.error?.message ?? message;
      } catch {
        // The response might not contain JSON.
      }
  
      throw new Error(message);
    }
  
    if (response.status === 204) {
      return null;
    }
  
    return response.json();
  }
  
  export const taskApi = {
    async list() {
      const result = await request("/api/tasks");
      return result.data;
    },
  
    async create(task) {
      const result = await request("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task)
      });
  
      return result.data;
    },
  
    async update(id, changes) {
      const result = await request(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
      });
  
      return result.data;
    },
  
    async remove(id) {
      await request(`/api/tasks/${id}`, {
        method: "DELETE"
      });
    }
  };
  