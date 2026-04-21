const API_BASE = "/api";

async function request(path, { method = "GET", headers = {}, body, token } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  let payload = null;
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = { data: null, error: await response.text(), meta: null };
  }

  if (!response.ok) {
    const error = payload?.error || response.statusText;
    throw new Error(error || "Request failed");
  }

  return payload;
}

export const api = {
  async login(username, password) {
    const result = await request("/auth/login", {
      method: "POST",
      body: { username, password },
    });
    return result.data;
  },

  async me(token) {
    const result = await request("/auth/me", { token });
    return result.data;
  },

  async listTasks({ token, status } = {}) {
    const qs = status ? `?status=${status}` : "";
    const result = await request(`/tasks${qs}`, { token });
    return result.data;
  },

  async getTask(id, token) {
    const result = await request(`/tasks/${id}`, { token });
    return result.data;
  },

  async createTask(data, token) {
    const result = await request("/tasks", { method: "POST", body: data, token });
    return result.data;
  },

  async updateTask(id, data, token) {
    const result = await request(`/tasks/${id}`, {
      method: "PATCH",
      body: data,
      token,
    });
    return result.data;
  },

  async deleteTask(id, token) {
    const result = await request(`/tasks/${id}`, { method: "DELETE", token });
    return result.data;
  },
};
