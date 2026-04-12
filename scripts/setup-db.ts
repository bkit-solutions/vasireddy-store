import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import mysql from "mysql2/promise";

function loadEnvFiles() {
  const root = process.cwd();
  const envFiles = [".env.local", ".env"];

  for (const file of envFiles) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
      config({ path: fullPath, override: true });
    }
  }
}

async function main() {
  loadEnvFiles();

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const dbUrl = new URL(rawUrl);
  const database = dbUrl.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  const connection = await mysql.createConnection({
    host: dbUrl.hostname,
    port: dbUrl.port ? Number(dbUrl.port) : 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    multipleStatements: false,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();

  console.log(`Database ready: ${database}`);
}

main().catch((error: unknown) => {
  console.error("Failed to prepare database:", error);
  process.exit(1);
});
