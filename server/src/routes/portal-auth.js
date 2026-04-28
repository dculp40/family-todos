import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db/init.js";
import { ENV } from "../config/env.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

const USERNAME_BY_EMAIL = {
  "culpdanny@gmail.com": "danny",
  "allie.martens18@gmail.com": "allie",
};

function serializeForInlineScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

router.post("/portal-login", (req, res) => {
  const portalToken = req.body?.portalToken;

  if (!portalToken || typeof portalToken !== "string") {
    return res.status(400).send("Missing portalToken");
  }

  try {
    const payload = jwt.verify(portalToken, ENV.PORTAL_JWT_SECRET);
    const email = payload.email;

    if (!email || typeof email !== "string") {
      return res.status(400).send("Portal token missing email");
    }

    const username = USERNAME_BY_EMAIL[email];
    if (!username) {
      return res.status(403).send("Unauthorized user");
    }

    const user = db
      .prepare("SELECT id, username, display_name FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const authPayload = {
      token: generateToken(user),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      },
    };

    const serializedPayload = serializeForInlineScript(authPayload);

    res.set("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing in…</title>
  </head>
  <body>
    <script>
      sessionStorage.setItem("family-todo.portalAuth", ${serializedPayload});
      window.location.replace("/");
    </script>
  </body>
</html>`);
  } catch {
    return res.status(401).send("Invalid or expired portal token");
  }
});

export default router;
