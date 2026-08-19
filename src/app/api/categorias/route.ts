import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const result = await db.query(
    `SELECT id, nome, slug FROM pops.categorias ORDER BY ordem, nome`
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const payload = await getAuthPayload();
  if (!payload || payload.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores do hub podem cadastrar categorias." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json({ error: "Nome da categoria é obrigatório." }, { status: 400 });
  }

  const result = await db.query(
    `INSERT INTO pops.categorias (nome, slug) VALUES ($1, $2)
     ON CONFLICT (nome) DO NOTHING
     RETURNING id, nome, slug`,
    [nome, slugify(nome)]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Categoria já existe." }, { status: 409 });
  }

  return NextResponse.json(result.rows[0], { status: 201 });
}
