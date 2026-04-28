import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db/init.js";
import { authenticate } from "../middleware/auth.js";
import { ENV } from "../config/env.js";

const router = Router();

// All task routes require authentication
router.use(authenticate);

function authenticatePortal(req, res) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ data: null, error: "Authentication required", meta: null });
    return null;
  }

  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, ENV.PORTAL_JWT_SECRET);
    return payload;
  } catch {
    res
      .status(401)
      .json({ data: null, error: "Invalid or expired token", meta: null });
    return null;
  }
}

// GET /api/tasks/portal — read-only task feed for the portal
router.get("/portal", (req, res) => {
  const portalUser = authenticatePortal(req, res);
  if (!portalUser) return;

  try {
    const tasks = db
      .prepare(
        `SELECT t.*,
          opener.display_name AS opener_name,
          closer.display_name AS closer_name
        FROM tasks t
        LEFT JOIN users opener ON t.opened_by = opener.id
        LEFT JOIN users closer ON t.closed_by = closer.id
        WHERE t.status = 'open'
        ORDER BY t.important DESC, t.urgent DESC, t.opened_at DESC
        LIMIT 8`,
      )
      .all();

    return res.json({
      data: tasks,
      error: null,
      meta: { count: tasks.length, user: portalUser.email ?? null },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Failed to fetch portal tasks", meta: null });
  }
});

// GET /api/tasks — list tasks with optional ?status=open|closed
router.get("/", (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT t.*,
        opener.display_name AS opener_name,
        closer.display_name AS closer_name
      FROM tasks t
      LEFT JOIN users opener ON t.opened_by = opener.id
      LEFT JOIN users closer ON t.closed_by = closer.id
    `;
    const params = [];

    if (status && ["open", "closed"].includes(status)) {
      sql += " WHERE t.status = ?";
      params.push(status);
    }

    sql += " ORDER BY t.opened_at DESC";

    const tasks = db.prepare(sql).all(...params);
    return res.json({
      data: tasks,
      error: null,
      meta: { count: tasks.length },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Failed to fetch tasks", meta: null });
  }
});

// GET /api/tasks/:id — single task
router.get("/:id", (req, res) => {
  try {
    const task = db
      .prepare(
        `SELECT t.*,
          opener.display_name AS opener_name,
          closer.display_name AS closer_name
        FROM tasks t
        LEFT JOIN users opener ON t.opened_by = opener.id
        LEFT JOIN users closer ON t.closed_by = closer.id
        WHERE t.id = ?`,
      )
      .get(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ data: null, error: "Task not found", meta: null });
    }
    return res.json({ data: task, error: null, meta: null });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Failed to fetch task", meta: null });
  }
});

// POST /api/tasks — create a task
router.post("/", (req, res) => {
  try {
    const { title, notes, important, urgent } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ data: null, error: "Title is required", meta: null });
    }

    const result = db
      .prepare(
        `INSERT INTO tasks (title, notes, status, important, urgent, opened_by, opened_at, updated_at)
         VALUES (?, ?, 'open', ?, ?, ?, datetime('now'), datetime('now'))`,
      )
      .run(
        title.trim(),
        notes || "",
        important ? 1 : 0,
        urgent ? 1 : 0,
        req.user.id,
      );

    const task = db
      .prepare(
        `SELECT t.*,
          opener.display_name AS opener_name,
          closer.display_name AS closer_name
        FROM tasks t
        LEFT JOIN users opener ON t.opened_by = opener.id
        LEFT JOIN users closer ON t.closed_by = closer.id
        WHERE t.id = ?`,
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({ data: task, error: null, meta: null });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Failed to create task", meta: null });
  }
});

// PATCH /api/tasks/:id — update a task
router.patch("/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ data: null, error: "Task not found", meta: null });
    }

    const { title, notes, status, important, urgent } = req.body;
    const updates = [];
    const params = [];

    if (title !== undefined) {
      if (!title.trim()) {
        return res
          .status(400)
          .json({ data: null, error: "Title cannot be empty", meta: null });
      }
      updates.push("title = ?");
      params.push(title.trim());
    }

    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }

    if (important !== undefined) {
      updates.push("important = ?");
      params.push(important ? 1 : 0);
    }

    if (urgent !== undefined) {
      updates.push("urgent = ?");
      params.push(urgent ? 1 : 0);
    }

    if (status !== undefined) {
      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({
          data: null,
          error: "Status must be 'open' or 'closed'",
          meta: null,
        });
      }
      updates.push("status = ?");
      params.push(status);

      if (status === "closed" && existing.status === "open") {
        updates.push("closed_by = ?", "closed_at = datetime('now')");
        params.push(req.user.id);
      } else if (status === "open" && existing.status === "closed") {
        updates.push("closed_by = NULL", "closed_at = NULL");
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ data: null, error: "No fields to update", meta: null });
    }

    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(
      ...params,
    );

    const task = db
      .prepare(
        `SELECT t.*,
          opener.display_name AS opener_name,
          closer.display_name AS closer_name
        FROM tasks t
        LEFT JOIN users opener ON t.opened_by = opener.id
        LEFT JOIN users closer ON t.closed_by = closer.id
        WHERE t.id = ?`,
      )
      .get(req.params.id);

    return res.json({ data: task, error: null, meta: null });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Failed to update task", meta: null });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ data: null, error: "Task not found", meta: null });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    return res.json({
      data: { deleted: true, id: Number(req.params.id) },
      error: null,
      meta: null,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Failed to delete task", meta: null });
  }
});

export default router;
