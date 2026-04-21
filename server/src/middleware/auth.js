import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "family-todo-secret-change-me";

export function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ data: null, error: "Authentication required", meta: null });
  }

  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ data: null, error: "Invalid or expired token", meta: null });
  }
}
