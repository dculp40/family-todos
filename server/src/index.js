import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ENV, ROOT_DIR } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import portalAuthRoutes from "./routes/portal-auth.js";
import taskRoutes from "./routes/tasks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = ENV.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use(portalAuthRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    data: { status: "ok", timestamp: new Date().toISOString() },
    error: null,
    meta: null,
  });
});

// Serve static frontend in production
const clientDist = path.resolve(ROOT_DIR, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
