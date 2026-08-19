import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload, isPopsAdmin } from "@/lib/auth";
import { isUniqueViolation } from "@/lib/pg-errors";

export async function GET() {
  const result = await db.query(`SELECT id, nome FROM pops.tags ORDER BY nome`);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const payload = await getAuthPayload();
  if (!isPopsAdmin(payload)) {
    return NextResponse.json({ error: "Sem permissão para gerenciar tags." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json({ error: "Nome da tag é obrigatório." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `INSERT INTO pops.tags (nome) VALUES ($1) RETURNING id, nome`,
      [nome]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "Essa tag já existe." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar tag." }, { status: 500 });
  }
}
