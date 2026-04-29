import "../config/env.js";
import bcrypt from "bcryptjs";
import db from "./init.js";

const SALT_ROUNDS = 10;

async function seed() {
  const users = [
    { username: "danny", displayName: "Danny", password: "danny123" },
    { username: "allie", displayName: "Allie", password: "allie123" },
  ];

  const upsert = db.prepare(`
    INSERT INTO users (username, password_hash, display_name)
    VALUES (?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      display_name = excluded.display_name
  `);

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    upsert.run(u.username, hash, u.displayName);
    console.log(`Seeded user: ${u.username} (password: ${u.password})`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed();
