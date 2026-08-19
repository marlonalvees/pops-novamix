import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { deletePop, getPopBySlug, updatePop } from "@/lib/pops-repository";
import { parsePopFormData } from "@/lib/pop-form-data";
import { ForbiddenError, PopNotFoundError } from "@/lib/errors";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const pop = await getPopBySlug(slug);
  if (!pop) return NextResponse.json({ error: "POP não encontrado." }, { status: 404 });
  return NextResponse.json(pop);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const payload = await getAuthPayload();

  let input: Awaited<ReturnType<typeof parsePopFormData>>;
  try {
    input = await parsePopFormData(await req.formData());
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  try {
    await updatePop(slug, input.dados, input.arquivos, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PopNotFoundError) {
      return NextResponse.json({ error: "POP não encontrado." }, { status: 404 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: "Sem permissão para editar este POP." },
        { status: 403 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar POP." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const payload = await getAuthPayload();

  try {
    await deletePop(slug, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PopNotFoundError) {
      return NextResponse.json({ error: "POP não encontrado." }, { status: 404 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: "Sem permissão para excluir este POP." },
        { status: 403 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir POP." }, { status: 500 });
  }
}
