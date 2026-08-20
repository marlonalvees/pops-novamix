import { config } from "dotenv";
import { Pool } from "pg";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não encontrada no .env");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS pops`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.categorias (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(80) NOT NULL UNIQUE,
      slug VARCHAR(80) NOT NULL UNIQUE,
      ordem INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.pops (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL UNIQUE,
      titulo VARCHAR(200) NOT NULL,
      categoria_id INT NOT NULL REFERENCES pops.categorias(id),
      video_url TEXT,
      status BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pops_categoria ON pops.pops(categoria_id)`);
  await pool.query(`ALTER TABLE pops.pops ADD COLUMN IF NOT EXISTS user_hub_id INT`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.passos (
      id SERIAL PRIMARY KEY,
      pop_id INT NOT NULL REFERENCES pops.pops(id) ON DELETE CASCADE,
      ordem INT NOT NULL,
      descricao TEXT NOT NULL,
      UNIQUE (pop_id, ordem)
    )
  `);
  await pool.query(
    `ALTER TABLE pops.passos ADD COLUMN IF NOT EXISTS informacoes_extras TEXT`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.passo_imagens (
      id SERIAL PRIMARY KEY,
      passo_id INT NOT NULL REFERENCES pops.passos(id) ON DELETE CASCADE,
      nome_arquivo VARCHAR(255) NOT NULL,
      legenda VARCHAR(200),
      ordem INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_passo_imagens_passo ON pops.passo_imagens(passo_id)`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.tags (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(60) NOT NULL UNIQUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pops.pop_tags (
      pop_id INT NOT NULL REFERENCES pops.pops(id) ON DELETE CASCADE,
      tag_id INT NOT NULL REFERENCES pops.tags(id) ON DELETE CASCADE,
      PRIMARY KEY (pop_id, tag_id)
    )
  `);

  console.log("Schema e tabelas de pops criados/confirmados com sucesso.");
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
