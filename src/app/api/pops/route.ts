import { NextRequest, NextResponse } from "next/server";
import { canManageCategoria, getAuthPayload } from "@/lib/auth";
import { createPop, listPops } from "@/lib/pops-repository";
import { parsePopFormData } from "@/lib/pop-form-data";

export async function GET(req: NextRequest) {
  const categoria = req.nextUrl.searchParams.get("categoria") ?? undefined;
  const pops = await listPops({ categoria });
  return NextResponse.json(pops);
}

export async function POST(req: NextRequest) {
  const payload = await getAuthPayload();

  let input: Awaited<ReturnType<typeof parsePopFormData>>;
  try {
    input = await parsePopFormData(await req.formData());
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (!canManageCategoria(payload, input.dados.categoria)) {
    return NextResponse.json(
      { error: "Você não tem permissão para cadastrar POPs nessa categoria." },
      { status: 403 }
    );
  }

  try {
    const slug = await createPop(input.dados, input.arquivos);
    return NextResponse.json({ slug }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao cadastrar POP." }, { status: 500 });
  }
}
