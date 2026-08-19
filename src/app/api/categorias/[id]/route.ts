import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/pg-errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const payload = await getAuthPayload();
  if (!payload || payload.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores do hub podem editar categorias." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json({ error: "Nome da categoria é obrigatório." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `UPDATE pops.categorias SET nome = $1, slug = $2 WHERE id = $3 RETURNING id, nome, slug`,
      [nome, slugify(nome), id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "Já existe uma categoria com esse nome." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao editar categoria." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const payload = await getAuthPayload();
  if (!payload || payload.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores do hub podem excluir categorias." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const result = await db.query(`DELETE FROM pops.categorias WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return NextResponse.json(
        { error: "Não é possível excluir: existem POPs cadastrados nessa categoria." },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir categoria." }, { status: 500 });
  }
}
