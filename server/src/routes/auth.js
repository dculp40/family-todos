import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/init.js";
import { ENV } from "../config/env.js";
import { generateToken, authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        data: null,
        error: "Username and password are required",
        meta: null,
      });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username.toLowerCase());
    if (!user) {
      return res
        .status(401)
        .json({ data: null, error: "Invalid credentials", meta: null });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res
        .status(401)
        .json({ data: null, error: "Invalid credentials", meta: null });
    }

    const token = generateToken(user);
    return res.json({
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
        },
      },
      error: null,
      meta: null,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, error: "Internal server error", meta: null });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const user = db
    .prepare("SELECT id, username, display_name FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user) {
    return res
      .status(404)
      .json({ data: null, error: "User not found", meta: null });
  }
  return res.json({
    data: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    },
    error: null,
    meta: null,
  });
});

// POST /api/auth/portal-login
router.post("/portal-login", (req, res) => {
  const { portalToken } = req.body || {};

  if (!portalToken || typeof portalToken !== "string") {
    return res
      .status(400)
      .json({ data: null, error: "Missing portalToken", meta: null });
  }

  try {
    const payload = jwt.verify(portalToken, ENV.PORTAL_JWT_SECRET);
    const email = payload.email;

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ data: null, error: "Portal token missing email", meta: null });
    }

    const USERNAME_BY_EMAIL = {
      "culpdanny@gmail.com": "danny",
      "allie.martens18@gmail.com": "allie",
    };

    const username = USERNAME_BY_EMAIL[email];
    if (!username) {
      return res
        .status(403)
        .json({ data: null, error: "Unauthorized user", meta: null });
    }

    const user = db
      .prepare(
        "SELECT id, username, display_name FROM users WHERE username = ?",
      )
      .get(username);
    if (!user) {
      return res
        .status(404)
        .json({ data: null, error: "User not found", meta: null });
    }

    const token = generateToken(user);
    return res.json({
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
        },
      },
      error: null,
      meta: null,
    });
  } catch {
    return res.status(401).json({
      data: null,
      error: "Invalid or expired portal token",
      meta: null,
    });
  }
});

export default router;
