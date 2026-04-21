import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../");

dotenv.config({ path: path.resolve(ROOT_DIR, ".env") });

const resolveDbPath = () => {
  const configured = process.env.DB_PATH;
  if (!configured) {
    return path.resolve(ROOT_DIR, "data/family-todo.db");
  }
  if (path.isAbsolute(configured)) {
    return configured;
  }
  return path.resolve(ROOT_DIR, configured);
};

export const ENV = {
  PORT: Number(process.env.PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET || "family-todo-secret-change-me",
  DB_PATH: resolveDbPath(),
};

export { ROOT_DIR };
