import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não encontrada no .env.local");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS pops`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.pops (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL UNIQUE,
      titulo VARCHAR(200) NOT NULL,
      categoria VARCHAR(80) NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      video_url TEXT,
      passos TEXT[] NOT NULL DEFAULT '{}',
      status BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  console.log("Schema e tabela pops.pops criados/confirmados com sucesso.");
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
