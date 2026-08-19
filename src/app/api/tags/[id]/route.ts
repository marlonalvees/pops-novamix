import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload, isPopsAdmin } from "@/lib/auth";
import { isUniqueViolation } from "@/lib/pg-errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const payload = await getAuthPayload();
  if (!isPopsAdmin(payload)) {
    return NextResponse.json({ error: "Sem permissão para gerenciar tags." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json({ error: "Nome da tag é obrigatório." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `UPDATE pops.tags SET nome = $1 WHERE id = $2 RETURNING id, nome`,
      [nome, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Tag não encontrada." }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "Já existe uma tag com esse nome." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao editar tag." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const payload = await getAuthPayload();
  if (!isPopsAdmin(payload)) {
    return NextResponse.json({ error: "Sem permissão para gerenciar tags." }, { status: 403 });
  }

  const { id } = await params;
  const result = await db.query(`DELETE FROM pops.tags WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Tag não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
